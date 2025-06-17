
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Home } from 'lucide-react';
import { toast } from 'sonner';

interface AdminNavigationProps {
  onSettingsClick?: () => void;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Default behavior - you can customize this
      toast.info('Settings functionality available in the admin dashboard');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-8 h-8 tennis-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SEED Admin</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Home className="w-4 h-4 mr-2" />
                User App
              </Button>
            </Link>
            
            <Button 
              onClick={handleSettingsClick}
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;
