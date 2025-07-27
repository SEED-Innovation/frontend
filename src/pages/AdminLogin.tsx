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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Orb */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Secondary Orb */}
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
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
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-xl opacity-30" />
              <div className="relative bg-gradient-to-r from-primary to-secondary p-4 rounded-3xl shadow-2xl">
                <Shield className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Muli, sans-serif' }}>
              SEED Admin
            </h1>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Secure Administrative Access Portal
            </p>
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card/90 backdrop-blur-2xl border-border/50 shadow-2xl relative overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50" />
            
            <CardHeader className="text-center space-y-3 pb-6 relative">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-3" style={{ fontFamily: 'Muli, sans-serif' }}>
                <Zap className="w-6 h-6 text-accent" />
                Admin Portal
              </CardTitle>
              <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Enter your administrative credentials to access the SEED management dashboard
              </p>
            </CardHeader>

            <CardContent className="space-y-6 relative">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    Administrator Email
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@seed.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-14 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all duration-300 pl-12 text-base group-hover:border-accent/50"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
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
                      className="h-14 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all duration-300 pl-12 pr-12 text-base group-hover:border-accent/50"
                      required
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                    <motion.button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors duration-200 p-1 z-10"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      disabled={isLoading}
                      className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Keep me signed in
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-accent hover:text-accent/80 font-medium transition-colors duration-200"
                    onClick={() => toast.info('Contact your system administrator for password reset')}
                    disabled={isLoading}
                  >
                    Need help?
                  </button>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center relative z-10">
                        <motion.div 
                          className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Authenticating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative z-10 group">
                        <Shield className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                        Access Admin Dashboard
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