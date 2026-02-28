using BaseProject.UserManagement.Users;
using BaseProject.UserManagement.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace BaseProject.UserManagement.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : AbpControllerBase
{
    private readonly IAuthAppService _authAppService;

    public AuthController(IAuthAppService authAppService)
    {
        _authAppService = authAppService;
    }

    [HttpPost("login/phone")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResultDto>> LoginWithPhone([FromBody] LoginWithPhoneDto input)
    {
        var result = await _authAppService.LoginWithPhoneAsync(input);
        return Ok(result);
    }

    [HttpPost("login/google")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResultDto>> LoginWithGoogle([FromBody] GoogleLoginDto input)
    {
        var result = await _authAppService.LoginWithGoogleAsync(input);
        return Ok(result);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResultDto>> Register([FromBody] RegisterDto input)
    {
        var result = await _authAppService.RegisterAsync(input);
        return Ok(result);
    }

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResultDto>> RefreshToken([FromBody] TokenRefreshDto input)
    {
        var result = await _authAppService.RefreshTokenAsync(input);
        return Ok(result);
    }
}
