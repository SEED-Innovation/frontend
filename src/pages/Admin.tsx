
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import CourtManagement from '@/components/admin/CourtManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import ReportsAnalytics from '@/components/admin/ReportsAnalytics';
import SessionMonitoring from '@/components/admin/SessionMonitoring';
import SystemAnalytics from '@/components/admin/SystemAnalytics';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminProfile from '@/components/admin/AdminProfile';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminBooking from '@/components/admin/AdminBooking';


const Admin = () => {
  const { loading, user } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if user is not authenticated or doesn't have admin privileges
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    window.location.href = '/admin-login';
    return null;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/players" element={<UserManagement />} />
        <Route path="/courts" element={<CourtManagement />} />
        <Route path="/bookings" element={<AdminBooking />} />
        <Route path="/sessions" element={<SessionMonitoring />} />
        <Route path="/payments" element={<PaymentManagement />} />
        <Route path="/analytics" element={<SystemAnalytics />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/reports" element={<ReportsAnalytics />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
