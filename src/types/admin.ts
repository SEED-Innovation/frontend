export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminUser {
  id: string; // JWT sub, but can be converted to number for backend
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

export interface PaymentTransaction {
  id: string;
  reference: string;
  playerName: string;
  playerEmail: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  method: 'card' | 'wallet' | 'bank_transfer';
  tapReference?: string;
  courtName: string;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  courtId: string;
  courtName: string;
  playerId: string;
  playerName: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  status: 'active' | 'completed' | 'cancelled';
  bookingId: string;
  notes?: string;
}

export interface ReportData {
  monthlyRevenue: Array<{ month: string; revenue: number; bookings: number }>;
  peakUsageTimes: Array<{ hour: number; bookings: number }>;
  topCourts: Array<{ courtName: string; revenue: number; bookings: number }>;
  paymentMethodStats: Array<{ method: string; count: number; percentage: number }>;
}