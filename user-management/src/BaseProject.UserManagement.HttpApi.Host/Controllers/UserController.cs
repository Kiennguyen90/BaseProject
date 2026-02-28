using BaseProject.UserManagement.Users;
using BaseProject.UserManagement.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace BaseProject.UserManagement.Controllers;

[Route("api/users")]
[ApiController]
[Authorize(Roles = "Admin")]
public class UserController : AbpControllerBase
{
    private readonly IUserAppService _userAppService;

    public UserController(IUserAppService userAppService)
    {
        _userAppService = userAppService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<UserDto>>> GetList([FromQuery] PagedAndSortedResultRequestDto input)
    {
        var result = await _userAppService.GetListAsync(input);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> Get(Guid id)
    {
        var result = await _userAppService.GetAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto input)
    {
        var result = await _userAppService.CreateAsync(input);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> Update(Guid id, [FromBody] CreateUserDto input)
    {
        var result = await _userAppService.UpdateAsync(id, input);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _userAppService.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id}/roles")]
    public async Task<ActionResult<string[]>> GetRoles(Guid id)
    {
        var result = await _userAppService.GetRolesAsync(id);
        return Ok(result);
    }

    [HttpPut("{id}/roles")]
    public async Task<ActionResult> SetRoles(Guid id, [FromBody] string[] roleNames)
    {
        await _userAppService.SetRolesAsync(id, roleNames);
        return NoContent();
    }
}
