
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import CourtManagement from '@/components/admin/CourtManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import ReportsAnalytics from '@/components/admin/ReportsAnalytics';
import SessionMonitoring from '@/components/admin/SessionMonitoring';
import SystemAnalytics from '@/components/admin/SystemAnalytics';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminProfile from '@/components/admin/AdminProfile';
import CameraManagement from '@/components/admin/CameraManagement';
import NotificationManagement from '@/components/admin/NotificationManagement';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminBooking from '@/components/admin/AdminBooking';


const Admin = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { loading, user } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  //***** */ Redirect if user is not authenticated or doesn't have admin privileges
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    window.location.href = '/admin-login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar collapsed={sidebarCollapsed} />
      <AdminHeader 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        collapsed={sidebarCollapsed}
      />
      
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/users/:id" element={<div>User Profile - ID: {window.location.pathname.split('/').pop()}</div>} />
            <Route path="/players" element={<UserManagement />} />
            <Route path="/courts" element={<CourtManagement />} />
            {/* <Route path="/bookings" element={<BookingManagement />} /> */}
            <Route path="/bookings" element={<AdminBooking />} />
            <Route path="/sessions" element={<SessionMonitoring />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/analytics" element={<SystemAnalytics />} />
            <Route path="/cameras" element={<CameraManagement />} />
            <Route path="/notifications" element={<NotificationManagement />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
          </Routes>
        </div>
      </motion.main>
    </div>
  );
};

export default Admin;
