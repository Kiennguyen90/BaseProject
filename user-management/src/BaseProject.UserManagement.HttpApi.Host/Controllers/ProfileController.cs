using BaseProject.UserManagement.Users;
using BaseProject.UserManagement.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace BaseProject.UserManagement.Controllers;

[Route("api/profile")]
[ApiController]
[Authorize]
public class ProfileController : AbpControllerBase
{
    private readonly IProfileAppService _profileAppService;

    public ProfileController(IProfileAppService profileAppService)
    {
        _profileAppService = profileAppService;
    }

    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> Get()
    {
        var result = await _profileAppService.GetAsync();
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> Update([FromBody] UpdateProfileDto input)
    {
        var result = await _profileAppService.UpdateAsync(input);
        return Ok(result);
    }

    [HttpPut("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto input)
    {
        await _profileAppService.ChangePasswordAsync(input);
        return NoContent();
    }
}
