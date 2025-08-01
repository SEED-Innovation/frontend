import { useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '@/types/admin';

// Mock admin user for development
const mockAdminUser: AdminUser = {
  id: '1',
  name: 'OMAR OMAR',
  email: 'admin@seed.com',
  role: 'SUPER_ADMIN',
  assignedCourts: ['court-1', 'court-2', 'court-3'],
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
};

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and authentication
    const timer = setTimeout(() => {
      setUser(mockAdminUser);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const hasPermission = (requiredRole: AdminRole): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.role === requiredRole;
  };

  const canAccessCourt = (courtId: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.assignedCourts?.includes(courtId) || false;
  };

  const logout = () => {
    setUser(null);
    // Redirect to landing page
    window.location.href = '/';
  };

  return {
    user,
    loading,
    hasPermission,
    canAccessCourt,
    logout,
    isAuthenticated: !!user
  };
};