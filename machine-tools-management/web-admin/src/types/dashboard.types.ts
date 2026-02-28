export interface DashboardStats {
  totalDevices: number;
  availableDevices: number;
  borrowedDevices: number;
  brokenDevices: number;
  totalCategories: number;
  pendingBorrowRequests: number;
  pendingReturnRequests: number;
  overdueCount: number;
  totalEmployees: number;
  todayTransactions: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  activityType: string;
  description: string;
  employeeName: string;
  timestamp: string;
}
