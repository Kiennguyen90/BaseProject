using System.ComponentModel.DataAnnotations;
using BaseProject.MachineTools.Enums;

namespace BaseProject.MachineTools.Devices.Dtos;

public class CreateDeviceDto
{
    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(32)]
    public string Code { get; set; } = null!;

    [MaxLength(1024)]
    public string? Description { get; set; }

    [Required]
    public DeviceType DeviceType { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int TotalQuantity { get; set; }

    [MaxLength(256)]
    public string? Location { get; set; }

    [MaxLength(128)]
    public string? SerialNumber { get; set; }

    [MaxLength(512)]
    public string? ImageUrl { get; set; }

    [MaxLength(1024)]
    public string? Notes { get; set; }
}
