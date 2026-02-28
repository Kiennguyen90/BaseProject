using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Devices.Dtos;

public class DeviceDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public DeviceType DeviceType { get; set; }
    public int TotalQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public DeviceStatus Status { get; set; }
    public string? Location { get; set; }
    public string? SerialNumber { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime CreationTime { get; set; }
    public DateTime? LastModificationTime { get; set; }
    public List<DeviceImageDto> Images { get; set; } = new();
}
