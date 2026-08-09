export interface DashboardData {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  totalGroups: number;
  todayAttendance: number;
  paidPayments: number;
  pendingPayments: number;
  totalIncome: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}