import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import SeedLogo from '@/components/ui/seed-logo';
import FloatingParticles from '@/components/ui/floating-particles';
import { LanguageSelectionModal } from '@/components/common/LanguageSelectionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { completeLanguageSelection, getLanguageSelectionStatus } from '@/lib/api/services/playerUserService';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation('web');

  // Check if user needs language selection after login
  useEffect(() => {
    const checkLanguageSelectionStatus = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const status = await getLanguageSelectionStatus();
          if (status.needsLanguageSelection) {
            setShowLanguageSelection(true);
          }
        }
      } catch (error) {
        console.debug('Could not check language selection status:', error);
      }
    };

    // Only check on component mount if user is already authenticated
    checkLanguageSelectionStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error(t('forms.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error(t('forms.required') || 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Handle login
        // Simulate authentication process
        setTimeout(async () => {
          setIsLoading(false);
          toast.success(t('auth.welcomeBack') || 'Welcome back to SEED!');
          
          // Check if user needs language selection after login
          try {
            const status = await getLanguageSelectionStatus();
            if (status.needsLanguageSelection) {
              setShowLanguageSelection(true);
            } else {
              navigate('/dashboard');
            }
          } catch (error) {
            console.debug('Could not check language selection status, proceeding to dashboard');
            navigate('/dashboard');
          }
        }, 1500);
      } else {
        // Handle signup - show language selection first
        setTimeout(() => {
          setIsLoading(false);
          setIsSignupComplete(true);
          setShowLanguageSelection(true);
        }, 1500);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Authentication failed. Please try again.');
    }
  };

  const handleLanguageSelectedAndComplete = async (selectedLanguage: 'en' | 'ar') => {
    setIsLoading(true);
    
    try {
      if (isSignupComplete) {
        // Complete signup with language selection
        await completeLanguageSelection(selectedLanguage);
        toast.success(t('auth.accountCreated') || 'Account created successfully!');
      } else {
        // Update existing user's language preference
        await completeLanguageSelection(selectedLanguage);
        toast.success(t('language.preferenceUpdated') || 'Language preference updated!');
      }
      
      setShowLanguageSelection(false);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to complete language selection:', error);
      toast.error('Failed to save language preference. Please try again.');
    }
  };

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    toast.success(`Signing in with ${provider}...`);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen-fix bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orb */}
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-transparent rounded-full blur-3xl animate-pulse" />
        {/* Secondary gradient orb */}
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-400/15 via-pink-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        {/* Floating particles */}
        <FloatingParticles 
          count={8} 
          colors={['bg-blue-400/30', 'bg-indigo-400/40', 'bg-purple-400/30', 'bg-pink-400/25']} 
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section with enhanced animation */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <SeedLogo size="lg" className="hover:scale-105 transition-transform duration-300 drop-shadow-lg" />
            </motion.div>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              SEED Tennis
            </h1>
            <p className="text-sm text-muted-foreground/80">
              {language === 'ar' ? 'منصة التنس الذكية' : 'Smart Tennis Platform'}
            </p>
          </motion.div>
        </motion.div>

        {/* Enhanced Language Toggle */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <div className="flex items-center space-x-1 rtl:space-x-reverse bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-1 border border-white/20 dark:border-slate-700/50 shadow-lg">
            <Button
              variant={language === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                language === 'en' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              EN
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage('ar')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                language === 'ar' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              ع
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Main Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden auth-card glass-effect">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="text-center space-y-4 pb-6 relative">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent" style={{ fontFamily: 'Muli, sans-serif' }}>
                  {isLogin ? (language === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back') : (language === 'ar' ? 'انضم إلى سيد' : 'Join SEED')}
                </CardTitle>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-muted-foreground text-sm leading-relaxed" 
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {isLogin 
                  ? (language === 'ar' ? 'سجل دخولك إلى حسابك وتابع رحلتك في التنس' : 'Sign in to your account and continue your tennis journey')
                  : (language === 'ar' ? 'أنشئ حسابك وابدأ تطورك في التنس' : 'Create your account and start your tennis evolution')
                }
              </motion.p>
            </CardHeader>

            <CardContent className="space-y-6 relative">
              {/* Enhanced Social Login */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  variant="outline"
                  className="w-full h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group relative overflow-hidden social-button"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <svg className="w-5 h-5 mr-3 relative z-10" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="relative z-10 font-medium">{t('auth.continueWithGoogle')}</span>
                </Button>
                
                <Button
                  type="button"
                  onClick={() => handleSocialAuth('Apple')}
                  variant="outline"
                  className="w-full h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 group relative overflow-hidden social-button"
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <svg className="w-5 h-5 mr-3 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="relative z-10 font-medium">{t('auth.continueWithApple')}</span>
                </Button>
              </motion.div>

              <motion.div 
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 dark:bg-slate-800/80 text-muted-foreground backdrop-blur-sm rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {language === 'ar' ? 'أو المتابعة بالبريد الإلكتروني' : 'Or continue with email'}
                  </span>
                </div>
              </motion.div>

              {/* Enhanced Form */}
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {!isLogin && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="username" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={language === 'ar' ? 'اختر اسم مستخدم' : 'Choose a username'}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {language === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email Address'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'ar' ? 'أدخل عنوان بريدك الإلكتروني' : 'Enter your email address'}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 auth-input"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-500" />
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 pr-12 hover:border-slate-300 dark:hover:border-slate-600 auth-input"
                      required
                      disabled={isLoading}
                    />
                    <motion.button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>

                {!isLogin && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={language === 'ar' ? 'أكد كلمة المرور' : 'Confirm your password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-green-400 focus:ring-green-400/20 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                  </motion.div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={isLoading}
                        className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        {language === 'ar' ? 'تذكرني' : 'Remember me'}
                      </Label>
                    </div>
                    <motion.button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                      onClick={() => toast.info(language === 'ar' ? 'ميزة إعادة تعيين كلمة المرور قريباً!' : 'Password reset feature coming soon!')}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </motion.button>
                  </div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group relative overflow-hidden auth-button"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                    {isLoading ? (
                      <div className="flex items-center justify-center relative z-10">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {isLogin 
                          ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing In...') 
                          : (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating Account...')
                        }
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative z-10">
                        <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                        {isLogin 
                          ? (language === 'ar' ? 'تسجيل الدخول إلى سيد' : 'Sign In to SEED') 
                          : (language === 'ar' ? 'إنشاء حساب سيد' : 'Create SEED Account')
                        }
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Enhanced Switch Mode */}
              <motion.div 
                className="text-center pt-4 border-t border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <span className="text-muted-foreground text-sm">
                  {isLogin 
                    ? (language === 'ar' ? "ليس لديك حساب؟ " : "Don't have an account? ")
                    : (language === 'ar' ? "لديك حساب بالفعل؟ " : "Already have an account? ")
                  }
                </span>
                <motion.button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLogin 
                    ? (language === 'ar' ? 'أنشئ واحداً الآن' : 'Create one now')
                    : (language === 'ar' ? 'سجل الدخول بدلاً من ذلك' : 'Sign in instead')
                  }
                </motion.button>
              </motion.div>

              {/* Enhanced Guest Mode */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <Button 
                  type="button"
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  onClick={() => {
                    toast.info(language === 'ar' ? 'دخول كضيف...' : 'Entering guest mode...');
                    setTimeout(() => navigate('/dashboard'), 500);
                  }}
                  disabled={isLoading}
                >
                  {language === 'ar' ? 'المتابعة كضيف' : 'Continue as Guest'}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Additional Info */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center text-xs text-muted-foreground/80"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-slate-700/50">
            {t('auth.agreeToTerms')}{' '}
            <a href="https://www.seedco.sa/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline underline-offset-2">
              {t('auth.termsOfService')}
            </a>{' '}
            {t('auth.and')}{' '}
            <a href="https://www.seedco.sa/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline underline-offset-2">
              {t('auth.privacyPolicyLink')}
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={showLanguageSelection}
        onClose={() => {
          if (!isSignupComplete) {
            // Allow closing for existing users
            setShowLanguageSelection(false);
          }
          // For new signups, don't allow closing without selection
        }}
        onLanguageSelected={handleLanguageSelectedAndComplete}
        showSkip={!isSignupComplete} // Only show skip for existing users, not new signups
        title={isSignupComplete ? (language === 'ar' ? 'مرحباً بك في سيد!' : 'Welcome to SEED!') : (language === 'ar' ? 'اختر لغتك المفضلة' : 'Choose Your Preferred Language')}
        subtitle={isSignupComplete ? (language === 'ar' ? 'يرجى اختيار لغتك المفضلة للبدء.' : 'Please select your preferred language to get started.') : (language === 'ar' ? 'اختر اللغة التي تفضل استخدامها في حسابك' : 'Select the language you prefer to use for your account')}
      />
    </div>
  );
};

export default Auth;