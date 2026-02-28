using System.ComponentModel.DataAnnotations;

namespace BaseProject.MachineTools.Borrowing.Dtos;

public class CreateBorrowRequestDto
{
    [Required]
    public Guid DeviceId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    public DateTime ExpectedReturnDate { get; set; }

    [MaxLength(512)]
    public string? Purpose { get; set; }

    [MaxLength(1024)]
    public string? Notes { get; set; }
}
