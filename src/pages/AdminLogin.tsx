import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, ArrowLeft, Building, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useTranslation } from 'react-i18next';
import LanguageToggler from '@/components/ui/language-toggler';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const { t } = useTranslation('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error(t('login.pleaseFillAllFields'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Use real authentication from useAdminAuth hook
      await login(formData.email, formData.password);
      toast.success(t('login.welcomeToSeedAdmin'));
      navigate('/admin');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error(t('login.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern - matching dashboard style */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      {/* Animated background elements - subtle like dashboard */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/5 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Language Toggle - positioned like in dashboard header */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggler />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section - matching dashboard branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-3xl mb-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <Shield className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            SEED Admin
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {t('login.secureAccess')}
          </motion.p>
        </motion.div>

        {/* Login Card - matching dashboard card style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -2 }}
        >
          <Card className="premium-card shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Card glow effect - matching dashboard cards */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="text-center space-y-3 pb-8 relative">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  {t('login.adminLogin')}
                </CardTitle>
              </motion.div>
              <motion.p 
                className="text-gray-600 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {t('login.enterAdminCredentials')}
              </motion.p>
            </CardHeader>

            <CardContent className="space-y-6 relative">
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {/* Email Field - matching dashboard input style */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {t('login.adminEmail')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.enterEmailAddress')}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 hover:border-gray-300"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password Field - matching dashboard input style */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    {t('login.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('login.enterPassword')}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 pr-12 hover:border-gray-300"
                      required
                      disabled={isLoading}
                    />
                    <motion.button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Submit Button - matching dashboard button style */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {isLoading ? (
                      <div className="flex items-center justify-center relative z-10">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {t('login.signingIn')}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative z-10">
                        <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                        {t('login.accessAdminPanel')}
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Features Preview - matching dashboard style */}
              <motion.div 
                className="pt-6 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs text-gray-600">{t('login.smartDashboard')}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-xs text-gray-600">{t('menu.facilities')}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs text-gray-600">{t('menu.analytics')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Back Link - matching dashboard style */}
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <Link 
                  to="/" 
                  className="flex items-center justify-center text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  {t('login.backToMainApp')}
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;