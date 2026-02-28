namespace BaseProject.MachineTools.Dashboard.Dtos;

public class DashboardDto
{
    public int TotalDevices { get; set; }
    public int AvailableDevices { get; set; }
    public int InUseDevices { get; set; }
    public int BrokenDevices { get; set; }
    public int TotalCategories { get; set; }
    public int PendingBorrowRequests { get; set; }
    public int PendingReturnRequests { get; set; }
    public int OverdueRequests { get; set; }
    public int TotalEmployees { get; set; }
    public int TodayTransactions { get; set; }
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
}

public class RecentActivityDto
{
    public Guid Id { get; set; }
    public string ActivityType { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string EmployeeName { get; set; } = null!;
    public DateTime Timestamp { get; set; }
}
