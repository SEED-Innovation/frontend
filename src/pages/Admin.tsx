
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
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Admin = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
            <Route path="/courts" element={<CourtManagement />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
          </Routes>
        </div>
      </motion.main>
    </div>
  );
};

export default Admin;
