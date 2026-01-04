
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import saudiFlag from '@/assets/saudi-flag.png';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation('web');
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="SEED Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="text-xl font-bold">SEED</span>
              {/* Saudi Flag */}
              <img 
                src={saudiFlag} 
                alt="Saudi Arabia" 
                className="h-5 w-7 object-cover rounded-sm shadow-md border border-gray-600 ml-3 hover:scale-105 transition-transform duration-300"
                title="Saudi Arabia"
              />
            </div>
            <p className="text-gray-400 mb-4">
              {t('landing.footer.description')}
            </p>
            <div className="flex items-center space-x-4 mb-4">
              <LanguageToggle variant="ghost" size="sm" />
            </div>
            <div className="flex space-x-4">
              <a href="https://www.seedco.sa/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.privacyPolicy')}</a>
              <a href="https://www.seedco.sa/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.termsOfService')}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.support')}</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('landing.footer.product')}</h3>
            <ul className="space-y-2">
              <li><Link to="/courts" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.bookCourts')}</Link></li>
              <li><Link to="/leaderboard" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.leaderboards')}</Link></li>
              <li><Link to="/subscription" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.pricing')}</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('ui.faq')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('landing.footer.support')}</h3>
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
                <span>{t('landing.navigation.adminAccess')}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>{t('landing.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
