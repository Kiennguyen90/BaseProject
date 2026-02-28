using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BaseProject.UserManagement.Consts;
using BaseProject.UserManagement.Users.Dtos;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Identity;

namespace BaseProject.UserManagement.Users;

public class AuthAppService : ApplicationService, IAuthAppService
{
    private readonly IdentityUserManager _userManager;
    private readonly UserManager _domainUserManager;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IConfiguration _configuration;
    private readonly IIdentityUserRepository _identityUserRepository;

    public AuthAppService(
        IdentityUserManager userManager,
        UserManager domainUserManager,
        IUserProfileRepository profileRepository,
        IConfiguration configuration,
        IIdentityUserRepository identityUserRepository)
    {
        _userManager = userManager;
        _domainUserManager = domainUserManager;
        _profileRepository = profileRepository;
        _configuration = configuration;
        _identityUserRepository = identityUserRepository;
    }

    public async Task<LoginResultDto> LoginWithPhoneAsync(LoginWithPhoneDto input)
    {
        // Find user by phone number
        var users = await _identityUserRepository.GetListAsync(
            filter: input.PhoneNumber,
            maxResultCount: 1
        );

        var user = users.FirstOrDefault(u => u.PhoneNumber == input.PhoneNumber);
        if (user == null)
        {
            throw new UserFriendlyException("Invalid phone number or password.");
        }

        var isValid = await _userManager.CheckPasswordAsync(user, input.Password);
        if (!isValid)
        {
            throw new UserFriendlyException("Invalid phone number or password.");
        }

        return await GenerateLoginResultAsync(user);
    }

    public async Task<LoginResultDto> LoginWithGoogleAsync(GoogleLoginDto input)
    {
        var googleClientId = _configuration["GoogleAuth:ClientId"];

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleClientId }
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(input.IdToken, settings);
        }
        catch (InvalidJwtException)
        {
            throw new UserFriendlyException("Invalid Google token.");
        }

        // Find or create user
        var user = await _userManager.FindByEmailAsync(payload.Email);
        if (user == null)
        {
            user = new IdentityUser(
                GuidGenerator.Create(),
                payload.Email,
                payload.Email
            );

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                throw new UserFriendlyException(
                    string.Join(", ", result.Errors.Select(e => e.Description))
                );
            }

            await _userManager.AddToRoleAsync(user, RoleConsts.Employee);

            var profile = new UserProfile(
                GuidGenerator.Create(),
                user.Id,
                payload.Name ?? payload.Email
            )
            {
                AvatarUrl = payload.Picture
            };
            await _profileRepository.InsertAsync(profile);
        }

        return await GenerateLoginResultAsync(user);
    }

    public async Task<LoginResultDto> RegisterAsync(RegisterDto input)
    {
        // Check if phone already registered
        var existing = await _identityUserRepository.GetListAsync(
            filter: input.PhoneNumber,
            maxResultCount: 1
        );

        if (existing.Any(u => u.PhoneNumber == input.PhoneNumber))
        {
            throw new UserFriendlyException("Phone number is already registered.");
        }

        var user = await _domainUserManager.CreateUserWithProfileAsync(
            userName: input.PhoneNumber,
            password: input.Password,
            fullName: input.FullName,
            email: input.Email,
            phoneNumber: input.PhoneNumber,
            roleName: RoleConsts.Employee
        );

        return await GenerateLoginResultAsync(user);
    }

    public async Task<LoginResultDto> RefreshTokenAsync(TokenRefreshDto input)
    {
        var principal = GetPrincipalFromExpiredToken(input.RefreshToken);
        if (principal == null)
        {
            throw new UserFriendlyException("Invalid refresh token.");
        }

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            throw new UserFriendlyException("Invalid refresh token.");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new UserFriendlyException("User not found.");
        }

        return await GenerateLoginResultAsync(user);
    }

    private async Task<LoginResultDto> GenerateLoginResultAsync(IdentityUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var profile = await _profileRepository.FindByUserIdAsync(user.Id);

        var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationInMinutes", 60);
        var refreshDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpirationInDays", 7);

        var accessToken = GenerateJwtToken(user, roles.ToArray(), profile, expirationMinutes);
        var refreshToken = GenerateJwtToken(user, roles.ToArray(), profile, refreshDays * 24 * 60);

        return new LoginResultDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = expirationMinutes * 60,
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                FullName = profile?.FullName ?? user.UserName,
                AvatarUrl = profile?.AvatarUrl,
                Department = profile?.Department,
                EmployeeCode = profile?.EmployeeCode,
                IsActive = user.IsActive,
                Roles = roles.ToArray(),
                CreationTime = user.CreationTime
            }
        };
    }

    private string GenerateJwtToken(IdentityUser user, string[] roles, UserProfile? profile, int expirationMinutes)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:SecurityKey"]!)
        );
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("name", profile?.FullName ?? user.UserName),
            new("phone", user.PhoneNumber ?? ""),
            new("employee_code", profile?.EmployeeCode ?? ""),
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidAudience = _configuration["Jwt:Audience"],
            ValidateIssuer = true,
            ValidIssuer = _configuration["Jwt:Issuer"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:SecurityKey"]!)
            ),
            ValidateLifetime = false // We intentionally allow expired tokens for refresh
        };

        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(
                token, tokenValidationParameters, out var securityToken
            );

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
