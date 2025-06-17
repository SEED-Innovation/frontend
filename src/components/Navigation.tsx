
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/courts', label: 'Book Courts' },
    { path: '/checkin', label: 'Check-In' },
    { path: '/recordings', label: 'Recordings' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/challenges', label: 'Challenges' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 tennis-gradient rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
              SEED
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 animated-underline ${
                  isActive(link.path)
                    ? 'text-tennis-purple-600'
                    : 'text-gray-700 hover:text-tennis-purple-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-gray-700">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link to="/subscription">
              <Button className="tennis-button">
                Upgrade
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg animate-fade-in">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block text-base font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-tennis-purple-600'
                      : 'text-gray-700 hover:text-tennis-purple-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link to="/subscription" onClick={() => setIsMenuOpen(false)}>
                  <Button className="tennis-button w-full">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
