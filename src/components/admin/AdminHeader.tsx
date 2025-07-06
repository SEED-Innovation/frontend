import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  collapsed: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar, collapsed }) => {
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    toast.success('Logged out successfully');
    logout();
  };

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6"
      style={{ left: collapsed ? 80 : 280 }}
    >
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search bookings, players..."
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </Button>

        <div className="flex items-center space-x-3">
          {user && (
            <>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=843dff&color=fff`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
              </div>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </motion.header>
  );
};

export default AdminHeader;