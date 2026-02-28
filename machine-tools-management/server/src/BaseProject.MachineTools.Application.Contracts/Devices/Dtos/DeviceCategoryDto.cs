using System.ComponentModel.DataAnnotations;

namespace BaseProject.MachineTools.Devices.Dtos;

public class DeviceCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreationTime { get; set; }
    public int DeviceCount { get; set; }
}

public class CreateDeviceCategoryDto
{
    [Required]
    [MaxLength(128)]
    public string Name { get; set; } = null!;

    [MaxLength(512)]
    public string? Description { get; set; }
}

public class UpdateDeviceCategoryDto
{
    [Required]
    [MaxLength(128)]
    public string Name { get; set; } = null!;

    [MaxLength(512)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
