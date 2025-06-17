
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 tennis-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">SEED</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-powered tennis analytics platform that helps players improve their game through intelligent court monitoring and performance insights.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/courts" className="text-gray-400 hover:text-white transition-colors">Find Courts</Link></li>
              <li><Link to="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link to="/subscription" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>support@seed.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Tennis St, Sports City</li>
            </ul>
            
            {/* Admin Access */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <Link 
                to="/admin-login" 
                className="inline-flex items-center space-x-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>Admin Access</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2025 SEED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
