using BaseProject.MachineTools.Borrowing;
using BaseProject.MachineTools.Borrowing.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;

namespace BaseProject.MachineTools.Controllers;

[ApiController]
[Route("api/return-requests")]
[Authorize]
public class ReturnRequestController : ControllerBase
{
    private readonly IReturnRequestAppService _returnRequestAppService;

    public ReturnRequestController(IReturnRequestAppService returnRequestAppService)
    {
        _returnRequestAppService = returnRequestAppService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResultDto<ReturnRequestDto>> GetList([FromQuery] ReturnRequestListFilterDto input)
    {
        return await _returnRequestAppService.GetListAsync(input);
    }

    [HttpGet("my")]
    public async Task<PagedResultDto<ReturnRequestDto>> GetMyList([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _returnRequestAppService.GetMyListAsync(input);
    }

    [HttpGet("{id}")]
    public async Task<ReturnRequestDto> Get(Guid id)
    {
        return await _returnRequestAppService.GetAsync(id);
    }

    [HttpPost]
    public async Task<ReturnRequestDto> Create([FromBody] CreateReturnRequestDto input)
    {
        return await _returnRequestAppService.CreateAsync(input);
    }

    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Admin")]
    public async Task<ReturnRequestDto> Confirm(Guid id, [FromBody] ConfirmReturnDto input)
    {
        return await _returnRequestAppService.ConfirmAsync(id, input);
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<ReturnRequestDto> Reject(Guid id, [FromBody] RejectReturnDto input)
    {
        return await _returnRequestAppService.RejectAsync(id, input);
    }
}
