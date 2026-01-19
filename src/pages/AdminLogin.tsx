import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useTranslation } from 'react-i18next';
import FloatingParticles from '@/components/ui/floating-particles';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-slate-900/50 opacity-40"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-red-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
        {/* Floating particles */}
        <FloatingParticles 
          count={6} 
          colors={['bg-orange-400/20', 'bg-red-400/30', 'bg-yellow-400/25']} 
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Enhanced Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-3xl mb-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 hover:opacity-30 transition-opacity duration-300" />
            <Shield className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            SEED Admin
          </motion.h1>
          <motion.p 
            className="text-slate-400 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Secure Administrative Access
          </motion.p>
        </motion.div>

        {/* Enhanced Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -2 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden admin-card glass-effect">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="text-center space-y-3 pb-8 relative">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <CardTitle className="text-2xl font-semibold text-white">
                  {t('login.adminLogin')}
                </CardTitle>
              </motion.div>
              <motion.p 
                className="text-slate-400 text-sm"
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
                {/* Enhanced Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {t('login.adminEmail')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.enterEmailAddress')}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-200 hover:bg-white/10 hover:border-white/20 auth-input"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {t('password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('login.enterPassword')}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-200 pr-12 hover:bg-white/10 hover:border-white/20 auth-input"
                      required
                      disabled={isLoading}
                    />
                    <motion.button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
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

                {/* Enhanced Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 relative overflow-hidden group auth-button"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
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

              {/* Enhanced Back Link */}
              <motion.div 
                className="pt-6 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <Link 
                  to="/" 
                  className="flex items-center justify-center text-slate-400 hover:text-slate-300 text-sm transition-colors duration-200 group"
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