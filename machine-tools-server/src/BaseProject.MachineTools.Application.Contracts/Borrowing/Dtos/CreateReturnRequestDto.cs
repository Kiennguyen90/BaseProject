using System.ComponentModel.DataAnnotations;

namespace BaseProject.MachineTools.Borrowing.Dtos;

public class CreateReturnRequestDto
{
    [Required]
    public Guid BorrowRequestId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [MaxLength(256)]
    public string? Condition { get; set; }

    public bool IsBroken { get; set; }

    [MaxLength(1024)]
    public string? BrokenDescription { get; set; }

    [MaxLength(1024)]
    public string? Notes { get; set; }
}
