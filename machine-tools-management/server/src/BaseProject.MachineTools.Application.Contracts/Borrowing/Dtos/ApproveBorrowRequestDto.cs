namespace BaseProject.MachineTools.Borrowing.Dtos;

public class ApproveBorrowRequestDto
{
    public string? Notes { get; set; }
}

public class RejectBorrowRequestDto
{
    public string Reason { get; set; } = null!;
}
