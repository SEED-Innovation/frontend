export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  assignedCourts?: string[];
  avatar?: string;
}

export interface CourtStats {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'offline';
}

export interface DashboardStats {
  totalRevenue: number;
  todayBookings: number;
  activeCourts: number;
  totalUsers: number;
  pendingPayments: number;
  monthlyGrowth: number;
}

export interface BookingStatus {
  id: string;
  courtName: string;
  playerName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
}