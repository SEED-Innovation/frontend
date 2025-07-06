
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminBooking from '@/components/admin/AdminBooking';
import CourtInstallations from '@/components/admin/CourtInstallations';
import UserManagement from '@/components/admin/UserManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import SystemAnalytics from '@/components/admin/SystemAnalytics';
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
            <Route path="/bookings" element={<AdminBooking />} />
            <Route path="/courts" element={<CourtInstallations />} />
            <Route path="/players" element={<UserManagement />} />
            <Route path="/payments" element={<div className="p-6"><h1 className="text-2xl font-bold">Payments</h1><p>Payment management coming soon...</p></div>} />
            <Route path="/analytics" element={<SystemAnalytics />} />
            <Route path="/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Reports section coming soon...</p></div>} />
            <Route path="/sessions" element={<div className="p-6"><h1 className="text-2xl font-bold">Sessions</h1><p>Session monitoring coming soon...</p></div>} />
            <Route path="/system" element={<div className="p-6"><h1 className="text-2xl font-bold">System</h1><p>System management coming soon...</p></div>} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </motion.main>
    </div>
  );
};

export default Admin;
