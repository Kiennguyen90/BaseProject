namespace BaseProject.MachineTools.Devices.Dtos;

public class DeviceImageDto
{
    public Guid Id { get; set; }
    public Guid? DeviceId { get; set; }
    public Guid? BorrowRequestId { get; set; }
    public Guid? ReturnRequestId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string ImageType { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreationTime { get; set; }
}
