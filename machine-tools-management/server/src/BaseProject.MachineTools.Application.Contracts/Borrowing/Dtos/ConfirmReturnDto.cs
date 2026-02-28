namespace BaseProject.MachineTools.Borrowing.Dtos;

public class ConfirmReturnDto
{
    public string? Notes { get; set; }
}

public class RejectReturnDto
{
    public string Reason { get; set; } = null!;
}
