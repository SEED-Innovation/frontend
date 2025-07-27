import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, ArrowLeft, Mail, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import SeedLogo from '@/components/ui/seed-logo';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate admin authentication
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Welcome to SEED Admin Dashboard');
      navigate('/admin');
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-2 sm:p-4 lg:p-8 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.1),transparent_50%),radial-gradient(circle_at_40%_40%,hsl(var(--accent)/0.05),transparent_50%)]" />
        
        {/* Dynamic Orbs */}
        <motion.div 
          className="absolute top-10 right-10 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-10 left-10 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-secondary/15 to-primary/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-32 h-32 border border-accent/20 rounded-2xl rotate-45"
          animate={{
            rotate: [45, 225, 45],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />

        {/* Enhanced Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${i % 3 === 0 ? 'w-1 h-1 bg-primary/40' : i % 3 === 1 ? 'w-2 h-2 bg-accent/30' : 'w-1.5 h-1.5 bg-secondary/35'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl relative z-10 mx-auto"
      >
        {/* Logo Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 1, 0, -1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary via-accent to-secondary p-5 sm:p-6 rounded-full shadow-2xl ring-1 ring-white/20">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground drop-shadow-lg" />
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2 tracking-tight" style={{ fontFamily: 'Muli, sans-serif' }}>
              SEED Admin
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Secure Administrative Access Portal
            </p>
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card/80 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden rounded-3xl">
            {/* Enhanced Card Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent)/0.1),transparent_70%)]" />
            
            <CardHeader className="text-center space-y-4 pb-8 pt-8 sm:pt-10 relative">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-3" style={{ fontFamily: 'Muli, sans-serif' }}>
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </motion.div>
                Admin Portal
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Enter your administrative credentials to access the SEED management dashboard
              </p>
            </CardHeader>

            <CardContent className="space-y-6 sm:space-y-8 relative px-6 sm:px-8 pb-8 sm:pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div 
                  className="space-y-3"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="email" className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    Administrator Email
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your admin email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-14 sm:h-16 bg-background/60 border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-300 pl-12 sm:pl-14 pr-4 text-base sm:text-lg rounded-xl group-hover:border-accent/50 group-hover:bg-background/80"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>

                {/* Enhanced Password Field */}
                <motion.div 
                  className="space-y-3"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="password" className="text-sm sm:text-base font-medium text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-accent" />
                    Secure Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your secure password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-14 sm:h-16 bg-background/60 border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-300 pl-12 sm:pl-14 pr-14 sm:pr-16 text-base sm:text-lg rounded-xl group-hover:border-accent/50 group-hover:bg-background/80"
                      required
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                    
                    {/* Professional Password Toggle */}
                    <motion.button
                      type="button"
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200 z-10 group/toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 group-hover/toggle:scale-110 transition-transform" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 group-hover/toggle:scale-110 transition-transform" />
                      )}
                    </motion.button>
                    
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>

                {/* Enhanced Remember Me Section */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      disabled={isLoading}
                      className="border-border/60 data-[state=checked]:bg-accent data-[state=checked]:border-accent h-5 w-5 rounded-md"
                    />
                    <Label htmlFor="remember" className="text-sm sm:text-base text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      Keep me signed in
                    </Label>
                  </div>
                  <motion.button
                    type="button"
                    className="text-sm sm:text-base text-accent hover:text-accent/80 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
                    onClick={() => toast.info('Contact your system administrator for password reset')}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                  >
                    Need help?
                  </motion.button>
                </div>

                {/* Enhanced Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-2"
                >
                  <Button 
                    type="submit" 
                    className="w-full h-14 sm:h-16 bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-primary-foreground font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group rounded-xl"
                    disabled={isLoading}
                  >
                    {/* Enhanced Button Effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center relative z-10">
                        <motion.div 
                          className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-base sm:text-lg">Authenticating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative z-10">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-3 group-hover:animate-pulse" />
                        <span className="text-base sm:text-lg font-semibold">Access Admin Dashboard</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Back Link */}
              <motion.div 
                className="pt-6 border-t border-border"
                variants={itemVariants}
              >
                <Link 
                  to="/" 
                  className="flex items-center justify-center text-muted-foreground hover:text-accent text-sm transition-all duration-200 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Return to SEED Platform
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