import React from 'react';
import { motion } from 'framer-motion';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import LanguageToggler from '@/components/ui/language-toggler';

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


      </div>

      <div className="flex items-center space-x-4">
        <LanguageToggler />

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