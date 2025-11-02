import React, { useState } from 'react';
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
import { LanguageSelectionModal } from '@/components/common/LanguageSelectionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation('web');

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

    // For sign-up, show language selection first
    if (!isLogin) {
      setShowLanguageSelection(true);
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      setIsLoading(false);
      toast.success(isLogin ? t('auth.welcomeBack') || 'Welcome back to SEED!' : t('auth.accountCreated') || 'Account created successfully!');
      navigate('/dashboard');
    }, 1500);
  };

  const handleLanguageSelectedAndSignUp = async (selectedLanguage: 'en' | 'ar') => {
    setIsLoading(true);
    
    // Simulate sign-up process with language preference
    setTimeout(() => {
      setIsLoading(false);
      toast.success(t('auth.accountCreated') || 'Account created successfully!');
      navigate('/dashboard');
    }, 1500);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <SeedLogo size="lg" className="hover:scale-105 transition-transform duration-300" />
          </Link>
        </motion.div>

        {/* Language Toggle */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/50">
            <Button
              variant={language === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage('en')}
              className="px-3 py-1 text-xs"
            >
              EN
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage('ar')}
              className="px-3 py-1 text-xs"
            >
              ع
            </Button>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-3 pb-6">
              <CardTitle className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Muli, sans-serif' }}>
                {isLogin ? (language === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back') : (language === 'ar' ? 'انضم إلى سيد' : 'Join SEED')}
              </CardTitle>
              <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {isLogin 
                  ? (language === 'ar' ? 'سجل دخولك إلى حسابك وتابع رحلتك في التنس' : 'Sign in to your account and continue your tennis journey')
                  : (language === 'ar' ? 'أنشئ حسابك وابدأ تطورك في التنس' : 'Create your account and start your tennis evolution')
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  variant="outline"
                  className="w-full h-12 border-border hover:bg-accent/10 hover:border-accent/30 transition-all duration-200"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.continueWithGoogle')}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => handleSocialAuth('Apple')}
                  variant="outline"
                  className="w-full h-12 border-border hover:bg-accent/10 hover:border-accent/30 transition-all duration-200"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  {t('auth.continueWithApple')}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-card text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {language === 'ar' ? 'أو المتابعة بالبريد الإلكتروني' : 'Or continue with email'}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={language === 'ar' ? 'اختر اسم مستخدم' : 'Choose a username'}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="h-12 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all duration-200"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {language === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email Address'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'ar' ? 'أدخل عنوان بريدك الإلكتروني' : 'Enter your email address'}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all duration-200"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-12 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all duration-200 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={language === 'ar' ? 'أكد كلمة المرور' : 'Confirm your password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="h-12 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all duration-200"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        {language === 'ar' ? 'تذكرني' : 'Remember me'}
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-accent hover:text-accent/80 font-medium transition-colors duration-200"
                      onClick={() => toast.info(language === 'ar' ? 'ميزة إعادة تعيين كلمة المرور قريباً!' : 'Password reset feature coming soon!')}
                      disabled={isLoading}
                    >
                      {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      {isLogin 
                        ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing In...') 
                        : (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating Account...')
                      }
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                      {isLogin 
                        ? (language === 'ar' ? 'تسجيل الدخول إلى سيد' : 'Sign In to SEED') 
                        : (language === 'ar' ? 'إنشاء حساب سيد' : 'Create SEED Account')
                      }
                    </div>
                  )}
                </Button>
              </form>

              {/* Switch Mode */}
              <div className="text-center pt-4 border-t border-border">
                <span className="text-muted-foreground text-sm">
                  {isLogin 
                    ? (language === 'ar' ? "ليس لديك حساب؟ " : "Don't have an account? ")
                    : (language === 'ar' ? "لديك حساب بالفعل؟ " : "Already have an account? ")
                  }
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-accent hover:text-accent/80 font-medium text-sm transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLogin 
                    ? (language === 'ar' ? 'أنشئ واحداً الآن' : 'Create one now')
                    : (language === 'ar' ? 'سجل الدخول بدلاً من ذلك' : 'Sign in instead')
                  }
                </button>
              </div>

              {/* Guest Mode */}
              <div className="text-center">
                <Button 
                  type="button"
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200"
                  onClick={() => {
                    toast.info(language === 'ar' ? 'دخول كضيف...' : 'Entering guest mode...');
                    setTimeout(() => navigate('/dashboard'), 500);
                  }}
                  disabled={isLoading}
                >
                  {language === 'ar' ? 'المتابعة كضيف' : 'Continue as Guest'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center text-xs text-muted-foreground"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {t('auth.agreeToTerms')}{' '}
          <a href="https://www.seedco.sa/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors duration-200">
            {t('auth.termsOfService')}
          </a>{' '}
          {t('auth.and')}{' '}
          <a href="https://www.seedco.sa/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors duration-200">
            {t('auth.privacyPolicyLink')}
          </a>
        </motion.div>
      </motion.div>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={showLanguageSelection}
        onClose={() => setShowLanguageSelection(false)}
        onLanguageSelected={handleLanguageSelectedAndSignUp}
        showSkip={false}
        title={language === 'ar' ? 'اختر لغتك المفضلة' : 'Choose Your Preferred Language'}
        subtitle={language === 'ar' ? 'اختر اللغة التي تفضل استخدامها في حسابك' : 'Select the language you prefer to use for your account'}
      />
    </div>
  );
};

export default Auth;