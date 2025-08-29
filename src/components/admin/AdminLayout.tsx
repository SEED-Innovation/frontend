import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from './AdminSidebar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4",
          isMobile ? "block" : "hidden"
        )}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 tennis-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-gray-900">SEED Admin</span>
          </div>
        </div>
      </motion.header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "relative",
        isMobile ? "fixed z-50" : "relative z-10"
      )}>
        <motion.div
          initial={isMobile ? { x: -280 } : { x: 0 }}
          animate={{
            x: isMobile ? (mobileMenuOpen ? 0 : -280) : 0,
            width: !isMobile ? (sidebarCollapsed ? 80 : 280) : 280
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            "h-screen bg-white border-r border-gray-200 shadow-lg",
            isMobile && "fixed left-0 top-0"
          )}
        >
          {/* Desktop Toggle Button */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md"
            >
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-3 h-3" />
              </motion.div>
            </Button>
          )}

          {/* Mobile Close Button */}
          {isMobile && mobileMenuOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 z-10"
            >
              <X className="w-5 h-5" />
            </Button>
          )}

          <AdminSidebar collapsed={!isMobile && sidebarCollapsed} />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex-1 overflow-hidden",
          isMobile ? "pt-16" : "pt-0",
          !isMobile && sidebarCollapsed ? "ml-0" : "ml-0"
        )}
        style={{
          marginLeft: !isMobile ? (sidebarCollapsed ? '80px' : '280px') : '0px'
        }}
      >
        {/* Desktop Header */}
        {!isMobile && (
          <motion.header
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Additional header actions can go here */}
            </div>
          </motion.header>
        )}

        {/* Page Content */}
        <div className={cn(
          "h-full overflow-y-auto",
          isMobile ? "p-4" : "p-6"
        )}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default AdminLayout;