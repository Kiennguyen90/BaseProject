using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Devices;

public class DeviceCategory : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; private set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Device> Devices { get; set; } = new List<Device>();

    protected DeviceCategory() { }

    public DeviceCategory(Guid id, string name, string? description = null)
        : base(id)
    {
        SetName(name);
        Description = description;
    }

    public void SetName(string name)
    {
        Name = Check.NotNullOrWhiteSpace(name, nameof(name), maxLength: 128);
    }
}
