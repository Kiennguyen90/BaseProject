using BaseProject.MachineTools.Enums;
using Volo.Abp.Application.Dtos;

namespace BaseProject.MachineTools.Devices.Dtos;

public class DeviceListFilterDto : PagedAndSortedResultRequestDto
{
    public string? Filter { get; set; }
    public Guid? CategoryId { get; set; }
    public DeviceType? DeviceType { get; set; }
    public DeviceStatus? Status { get; set; }
}
