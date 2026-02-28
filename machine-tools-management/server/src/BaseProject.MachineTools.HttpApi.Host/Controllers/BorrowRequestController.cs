using BaseProject.MachineTools.Borrowing;
using BaseProject.MachineTools.Borrowing.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;

namespace BaseProject.MachineTools.Controllers;

[ApiController]
[Route("api/borrow-requests")]
[Authorize]
public class BorrowRequestController : ControllerBase
{
    private readonly IBorrowRequestAppService _borrowRequestAppService;

    public BorrowRequestController(IBorrowRequestAppService borrowRequestAppService)
    {
        _borrowRequestAppService = borrowRequestAppService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResultDto<BorrowRequestDto>> GetList([FromQuery] BorrowRequestListFilterDto input)
    {
        return await _borrowRequestAppService.GetListAsync(input);
    }

    [HttpGet("my")]
    public async Task<PagedResultDto<BorrowRequestDto>> GetMyList([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _borrowRequestAppService.GetMyListAsync(input);
    }

    [HttpGet("{id}")]
    public async Task<BorrowRequestDto> Get(Guid id)
    {
        return await _borrowRequestAppService.GetAsync(id);
    }

    [HttpPost]
    public async Task<BorrowRequestDto> Create([FromBody] CreateBorrowRequestDto input)
    {
        return await _borrowRequestAppService.CreateAsync(input);
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<BorrowRequestDto> Approve(Guid id, [FromBody] ApproveBorrowRequestDto input)
    {
        return await _borrowRequestAppService.ApproveAsync(id, input);
    }

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<BorrowRequestDto> Reject(Guid id, [FromBody] RejectBorrowRequestDto input)
    {
        return await _borrowRequestAppService.RejectAsync(id, input);
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResultDto<BorrowRequestDto>> GetPending([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _borrowRequestAppService.GetPendingAsync(input);
    }

    [HttpGet("overdue")]
    [Authorize(Roles = "Admin")]
    public async Task<PagedResultDto<BorrowRequestDto>> GetOverdue([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _borrowRequestAppService.GetOverdueAsync(input);
    }
}
