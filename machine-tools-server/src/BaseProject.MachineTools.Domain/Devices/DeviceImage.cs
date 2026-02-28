using Volo.Abp.Domain.Entities.Auditing;

namespace BaseProject.MachineTools.Devices;

public class DeviceImage : CreationAuditedEntity<Guid>
{
    public Guid? DeviceId { get; set; }
    public Guid? BorrowRequestId { get; set; }
    public Guid? ReturnRequestId { get; set; }
    public string ImageUrl { get; private set; } = null!;
    public string ImageType { get; private set; } = null!; // DevicePhoto, BorrowProof, ReturnProof, BrokenProof
    public string? Description { get; set; }

    // Navigation
    public Device? Device { get; set; }

    protected DeviceImage() { }

    public DeviceImage(Guid id, string imageUrl, string imageType, Guid? deviceId = null, Guid? borrowRequestId = null, Guid? returnRequestId = null)
        : base(id)
    {
        ImageUrl = imageUrl;
        ImageType = imageType;
        DeviceId = deviceId;
        BorrowRequestId = borrowRequestId;
        ReturnRequestId = returnRequestId;
    }
}
