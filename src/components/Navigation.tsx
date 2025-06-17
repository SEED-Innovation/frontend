
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg' 
        : 'bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <img 
              src="/lovable-uploads/9b877c55-5518-40cb-ba2c-a68fccfbe495.png" 
              alt="SEED Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">SEED</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  isActive(link.path)
                    ? 'text-tennis-purple-600'
                    : 'text-gray-700 hover:text-tennis-purple-600'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-tennis-purple-600 transition-all duration-300 ${
                  isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-tennis-purple-600 hover:bg-tennis-purple-50 transition-all duration-300">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link to="/subscription">
              <Button className="tennis-button hover:scale-105 transition-all duration-300">
                Upgrade
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-tennis-purple-50 transition-colors duration-300"
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
                  className={`block text-base font-medium transition-colors duration-300 py-2 ${
                    isActive(link.path)
                      ? 'text-tennis-purple-600 bg-tennis-purple-50 px-3 rounded-lg'
                      : 'text-gray-700 hover:text-tennis-purple-600 hover:bg-tennis-purple-50 px-3 rounded-lg'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-tennis-purple-50">
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
