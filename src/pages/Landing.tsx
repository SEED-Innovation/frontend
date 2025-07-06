import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, Calendar, Star, Eye, Trophy, Play, Zap, Target, Users, Menu, X, CheckCircle, Clock, Video, BarChart3, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    toast.info('Player app is mobile-only. This is the admin dashboard.');
    navigate('/admin-login');
  };

  const handleWatchDemo = () => {
    toast.info('Experience the admin dashboard');
    navigate('/admin-login');
  };

  const handleSocialAuth = (provider: string) => {
    toast.success(`Signing in with ${provider}...`);
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const features = [
    {
      icon: Eye,
      title: "AI-Powered Analysis",
      description: "Real-time computer vision tracks every shot, serve, and movement with precision"
    },
    {
      icon: Calendar,
      title: "Smart Court Booking",
      description: "Seamlessly book AI-enabled courts with integrated technology features"
    },
    {
      icon: Target,
      title: "Performance Insights",
      description: "Detailed analytics and personalized coaching tips to elevate your game"
    },
    {
      icon: Trophy,
      title: "Global Leaderboards",
      description: "Compete with players worldwide and track your progress over time"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get match analysis and highlights delivered within minutes of play"
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Connect with fellow players, share highlights, and join challenges"
    }
  ];

  const howItWorks = [
    {
      icon: Calendar,
      title: "Book Your Court",
      description: "Choose from AI-enabled courts in your area with our smart booking system"
    },
    {
      icon: Play,
      title: "Play & Record",
      description: "Simply check in and play - our cameras automatically record your session"
    },
    {
      icon: BarChart3,
      title: "AI Analyzes",
      description: "Advanced AI processes your game in real-time, tracking every shot and movement"
    },
    {
      icon: Trophy,
      title: "View Progress",
      description: "Access detailed insights, share highlights, and track your improvement"
    }
  ];

  const playerLevels = [
    {
      level: "Beginner",
      description: "Learn fundamentals with AI-guided feedback",
      features: ["Basic shot tracking", "Technique tips", "Progress tracking"]
    },
    {
      level: "Amateur",
      description: "Improve consistency and strategy",
      features: ["Advanced analytics", "Match insights", "Performance trends"]
    },
    {
      level: "Professional",
      description: "Elite-level analysis and optimization",
      features: ["Pro-level metrics", "Competition analysis", "Custom coaching"]
    }
  ];

  const benefits = [
    {
      icon: Video,
      title: "Automated Video Recording",
      description: "Every session automatically recorded and stored in the cloud"
    },
    {
      icon: BarChart3,
      title: "Detailed Statistics",
      description: "Shot placement, speed, accuracy, and improvement tracking"
    },
    {
      icon: Award,
      title: "Achievements & Badges",
      description: "Unlock rewards as you improve and reach new milestones"
    },
    {
      icon: MessageSquare,
      title: "Community Features",
      description: "Share highlights, connect with players, and join challenges"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tennis Coach & Former Pro",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=64&h=64&fit=crop&crop=face",
      quote: "SEED has revolutionized how I coach. The AI insights help my students improve faster than ever before."
    },
    {
      name: "Marcus Johnson",
      role: "Club Manager",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      quote: "Our members love the seamless booking experience and detailed match analytics. Game-changing technology."
    },
    {
      name: "Elena Rodriguez",
      role: "Amateur Player",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      quote: "I've improved my serve accuracy by 40% using SEED's analysis. It's like having a personal coach."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Players" },
    { number: "200+", label: "AI-Enabled Courts" },
    { number: "2M+", label: "Matches Analyzed" },
    { number: "98%", label: "Accuracy Rate" }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Enhanced Hero Section with Tennis Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Tennis Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/lovable-uploads/79b783b6-41ce-4e02-b743-ae78455d1827.png"
            alt="Tennis Court"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-tennis-purple-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-7xl mx-auto">
          {/* Enhanced Navigation */}
          <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`absolute top-8 left-0 right-0 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ${scrolled ? 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl mx-4 sm:mx-8' : ''}`}
          >
            <Link to="/" className="flex items-center space-x-3">
              <motion.img 
                src="/lovable-uploads/d6e16ac6-604a-4a7a-9497-3476e49278a1.png" 
                alt="SEED Logo" 
                className="h-10 w-auto"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <span className="text-2xl font-bold hidden sm:block">SEED</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <motion.div whileHover={{ y: -2 }}>
                <span className="text-white/60 text-sm">Admin Dashboard for</span>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <span className="text-white/60 text-sm">Tennis Court Management</span>
              </motion.div>
              <Link to="/admin-login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 border border-white/30 transition-all duration-300"
                  >
                    Admin Login
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleGetStarted}
                  className="bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-tennis-green-400"
                >
                  Get Started
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </motion.nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-20 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-fade-in z-50">
              <div className="space-y-4">
                <Link to="/courts" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Courts
                </Link>
                <Link to="/leaderboard" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Leaderboard
                </Link>
                <Link to="/recordings" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Recordings
                </Link>
                <Link to="/login" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/admin-login" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Admin Access
                </Link>
                <Button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleGetStarted();
                  }}
                  className="w-full bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-semibold py-3 rounded-xl"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}

          {/* Hero Content */}
          <div className="pt-32 sm:pt-40">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 sm:mb-8 leading-tight"
            >
              <motion.span 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="block"
              >
                Manage.
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block bg-gradient-to-r from-tennis-green-300 via-yellow-300 to-tennis-green-300 bg-clip-text text-transparent animate-glow"
              >
                Control.
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="block text-3xl sm:text-5xl md:text-6xl mt-4"
              >
                Succeed.
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 text-white/90 font-medium max-w-4xl mx-auto leading-relaxed px-4"
            >
              Complete tennis court management system. Admin dashboard for booking management, player analytics, and facility operations.
            </motion.p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in mb-12 sm:mb-16 px-4" style={{ animationDelay: '0.4s' }}>
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="w-full sm:w-auto bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl rounded-2xl shadow-2xl hover:scale-110 hover:shadow-tennis-green-500/50 transition-all duration-300 transform border-2 border-tennis-green-400 glow-button"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                Start Free Trial
              </Button>
              <Button 
                onClick={handleWatchDemo}
                size="lg" 
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-bold px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform"
              >
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 animate-fade-in px-4" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-4xl md:text-5xl font-black mb-2">{stat.number}</div>
                  <div className="text-white/80 text-sm sm:text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/60" />
        </div>
      </section>

      {/* How SEED Works Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-tennis-purple-50/50 to-tennis-green-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              How{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                SEED Works
              </span>
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              From booking to analysis - experience the future of tennis technology
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 tennis-gradient rounded-full mb-4 sm:mb-6">
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-tennis-purple-600 mb-2">STEP {index + 1}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Player Levels Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-tennis-purple-100 rounded-full filter blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tennis-green-100 rounded-full filter blur-3xl opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Designed for{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                All Levels
              </span>
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 font-medium">
              Whether you're just starting or competing professionally
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {playerLevels.map((player, index) => (
              <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 sm:p-8 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{player.level}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">{player.description}</p>
                  <ul className="space-y-2 sm:space-y-3">
                    {player.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm sm:text-base text-gray-700">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-tennis-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-tennis-purple-900 via-tennis-purple-700 to-tennis-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-tennis-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-tennis-bounce opacity-70" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-tennis-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-tennis-bounce opacity-70" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8">
            Backed by{' '}
            <span className="bg-gradient-to-r from-tennis-green-300 to-yellow-300 bg-clip-text text-transparent">
              Advanced AI
            </span>
          </h2>
          <p className="text-lg sm:text-2xl mb-8 sm:mb-12 text-white/90 font-medium max-w-4xl mx-auto leading-relaxed">
            Our computer vision technology captures every detail of your game, providing insights that were previously only available to professional players.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Eye className="w-12 h-12 sm:w-16 sm:h-16 text-tennis-green-300 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Computer Vision</h3>
              <p className="text-sm sm:text-base text-white/80">Advanced camera tracking for precise ball and player movement analysis</p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-tennis-green-300 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Real-time Processing</h3>
              <p className="text-sm sm:text-base text-white/80">Instant analysis and feedback delivered within minutes of your session</p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 sm:col-span-2 lg:col-span-1">
              <Target className="w-12 h-12 sm:w-16 sm:h-16 text-tennis-green-300 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Precision Analytics</h3>
              <p className="text-sm sm:text-base text-white/80">Shot placement, speed, and accuracy measured with professional-grade precision</p>
            </div>
          </div>
          
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-8 sm:px-16 py-4 sm:py-6 text-lg sm:text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform hover:shadow-white/50"
          >
            <Play className="w-6 h-6 sm:w-8 sm:h-8 mr-4" />
            Experience the Technology
          </Button>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-tennis-purple-50/50 to-tennis-green-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              What{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                You Get
              </span>
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Everything you need to elevate your tennis game
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 tennis-gradient rounded-3xl mb-4 sm:mb-6">
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{benefit.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Powered by{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                AI Excellence
              </span>
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Advanced computer vision and machine learning deliver insights that transform your game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 tennis-gradient rounded-3xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed flex-1">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-tennis-purple-100 rounded-full filter blur-3xl opacity-30" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-tennis-green-100 rounded-full filter blur-3xl opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                Champions
              </span>
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 font-medium">
              See what tennis professionals and enthusiasts are saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover h-full" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-3 sm:mr-4 border-4 border-tennis-purple-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm sm:text-base">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 flex-1">"{testimonial.quote}"</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 tennis-gradient">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 sm:mb-8">
            Ready to Transform Your Game?
          </h2>
          <p className="text-lg sm:text-2xl text-white/90 mb-8 sm:mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
            Join thousands of players already using SEED to reach their full potential
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="w-full sm:w-auto bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-12 sm:px-16 py-4 sm:py-6 text-lg sm:text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform hover:shadow-white/50"
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 mr-4" />
              Start Your Journey
            </Button>
            <Button 
              onClick={() => navigate('/courts')}
              size="lg" 
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 font-bold px-12 sm:px-16 py-4 sm:py-6 text-lg sm:text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform"
            >
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 mr-4" />
              Find Courts
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-4 sm:mb-6">
                <img 
                  src="/lovable-uploads/d6e16ac6-604a-4a7a-9497-3476e49278a1.png" 
                  alt="SEED Logo" 
                  className="h-10 sm:h-12 w-auto"
                />
                <span className="text-xl sm:text-2xl font-bold">SEED</span>
              </Link>
              <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 max-w-md">
                AI-powered tennis analytics platform helping players and coaches achieve excellence through data-driven insights.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleSocialAuth('Twitter')}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-tennis-purple-600 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm">𝕏</span>
                </button>
                <button 
                  onClick={() => handleSocialAuth('LinkedIn')}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-tennis-purple-600 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm">in</span>
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link to="/courts" className="hover:text-white transition-colors">Book Courts</Link></li>
                <li><Link to="/recordings" className="hover:text-white transition-colors">Match Analysis</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboards</Link></li>
                <li><Link to="/subscription" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><button onClick={() => toast.info('Help Center coming soon!')} className="hover:text-white transition-colors text-left">Help Center</button></li>
                <li><button onClick={() => toast.info('Contact form coming soon!')} className="hover:text-white transition-colors text-left">Contact Us</button></li>
                <li><button onClick={() => toast.info('Privacy policy coming soon!')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                <li><button onClick={() => toast.info('Terms coming soon!')} className="hover:text-white transition-colors text-left">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2025 SEED. All rights reserved. Built for the future of tennis.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
