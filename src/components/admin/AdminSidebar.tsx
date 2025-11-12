import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Trophy,
  MapPin,
  Camera,
  Bell,
  Building,
  Video
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface SidebarItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  superAdminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    titleKey: 'admin.menu.dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    titleKey: 'admin.menu.admins',
    href: '/admin/players',
    icon: Users,
    superAdminOnly: true,
  },
  {
    titleKey: 'admin.menu.facilities',
    href: '/admin/facilities',
    icon: Building,
  },
  {
    titleKey: 'admin.menu.courts',
    href: '/admin/courts',
    icon: Trophy,
  },
  {
    titleKey: 'admin.menu.bookings',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    titleKey: 'admin.menu.cameras',
    href: '/admin/cameras',
    icon: Camera,
    superAdminOnly: true,
  },
  {
    titleKey: 'admin.menu.recordings',
    href: '/admin/recordings',
    icon: Video,
    superAdminOnly: true,
  },
  {
    titleKey: 'admin.menu.notifications',
    href: '/admin/notifications',
    icon: Bell,
    superAdminOnly: true,
  },
  {
    titleKey: 'admin.menu.payments',
    href: '/admin/payments',
    icon: CreditCard,
    superAdminOnly: true,
  },
  {
    titleKey: 'admin.menu.analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    superAdminOnly: true,
  },
  {
    titleKey: 'admin.menu.settings',
    href: '/admin/settings',
    icon: Settings,
    superAdminOnly: true,
  },
  {
    titleKey: 'admin.menu.myProfile',
    href: '/admin/profile',
    icon: Trophy,
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const { user, hasPermission } = useAdminAuth();
  const { t } = useTranslation('web');

  const filteredItems = sidebarItems.filter(item => {
    // If item is not restricted to super admin, show it to all admins
    if (!item.superAdminOnly) return true;
    // If item is restricted to super admin, only show it to super admins
    return hasPermission('SUPER_ADMIN');
  });

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0, width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-3"
        >
          <div className="w-8 h-8 tennis-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">SEED Admin</h1>
              <p className="text-xs text-gray-500">{t('admin.menu.courtManagement')}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=843dff&color=fff`}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  collapsed ? 'mx-auto' : 'mr-3'
                )} />

                {!collapsed && (
                  <>
                    <span className="flex-1">{t(item.titleKey)}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {t(item.titleKey)}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default AdminSidebar;