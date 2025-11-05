import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, Calendar, Star, Eye, Trophy, Zap, Target, Users, Menu, X, CheckCircle, Clock, Video, BarChart3, Award, MessageSquare, Smartphone, Activity, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import StickerPeel from '../components/ui/StickerPeel'
import AppStoreButton from '../components/ui/AppStoreButton';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import logo from '/lovable-uploads/d6e16ac6-604a-4a7a-9497-3476e49278a1.png'

const Landing = () => {
  const { t } = useTranslation('web');
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
    toast.info(t('messages.info'));
    navigate('/admin-login');
  };

  const handleWatchDemo = () => {
    toast.info(t('messages.info'));
    navigate('/admin-login');
  };

  const handleSocialAuth = (provider: string) => {
    toast.success(`${t('auth.signInWith')} ${provider}...`);
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const features = [
    {
      icon: Eye,
      title: t('landing.features.heatmaps.title'),
      description: t('landing.features.heatmaps.description')
    },
    {
      icon: Zap,
      title: t('landing.features.speedTracking.title'),
      description: t('landing.features.speedTracking.description')
    },
    {
      icon: Target,
      title: t('landing.features.performanceInsights.title'),
      description: t('landing.features.performanceInsights.description')
    },
    {
      icon: Trophy,
      title: t('landing.features.shotAnalysis.title'),
      description: t('landing.features.shotAnalysis.description')
    },
    {
      icon: Calendar,
      title: t('landing.features.smartBooking.title'),
      description: t('landing.features.smartBooking.description')
    },
    {
      icon: Users,
      title: t('landing.features.communityHub.title'),
      description: t('landing.features.communityHub.description')
    }
  ];

  const howItWorks = [
    {
      icon: Calendar,
      title: t('landing.howItWorks.checkIn.title'),
      description: t('landing.howItWorks.checkIn.description')
    },
    {
      icon: Play,
      title: t('landing.howItWorks.play.title'),
      description: t('landing.howItWorks.play.description')
    },
    {
      icon: Trophy,
      title: t('landing.howItWorks.thrive.title'),
      description: t('landing.howItWorks.thrive.description')
    }
  ];

  const playerLevels = [
    {
      level: t('landing.playerLevels.beginner.title'),
      description: t('landing.playerLevels.beginner.description'),
      features: t('landing.playerLevels.beginner.features', { returnObjects: true }) as string[]
    },
    {
      level: t('landing.playerLevels.amateur.title'),
      description: t('landing.playerLevels.amateur.description'),
      features: t('landing.playerLevels.amateur.features', { returnObjects: true }) as string[]
    },
    {
      level: t('landing.playerLevels.professional.title'),
      description: t('landing.playerLevels.professional.description'),
      features: t('landing.playerLevels.professional.features', { returnObjects: true }) as string[]
    }
  ];

  const benefits = [
    {
      icon: Video,
      title: t('landing.whatYouGet.automatedVideo.title'),
      description: t('landing.whatYouGet.automatedVideo.description')
    },
    {
      icon: BarChart3,
      title: t('landing.whatYouGet.detailedStats.title'),
      description: t('landing.whatYouGet.detailedStats.description')
    },
    {
      icon: Award,
      title: t('landing.whatYouGet.achievements.title'),
      description: t('landing.whatYouGet.achievements.description')
    },
    {
      icon: MessageSquare,
      title: t('landing.whatYouGet.community.title'),
      description: t('landing.whatYouGet.community.description')
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tennis Coach & Former Pro",
      image: "https://images.unsplash.com/photo-1731055046084-1d9b1418b24e?w=64&h=64&fit=crop&crop=faces",
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
    { number: "50K+", label: t('landing.stats.activePlayers') },
    { number: "200+", label: t('landing.stats.aiEnabledCourts') },
    { number: "2M+", label: t('landing.stats.matchesAnalyzed') },
    { number: "98%", label: t('landing.stats.accuracyRate') }
  ];

  return (
    <div className="min-h-screen overflow-hidden">



      {/* Enhanced Hero Section with Tennis Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Tennis Background Image */}
        <div className="absolute inset-0">
          <img
            src="/lovable-uploads/79b783b6-41ce-4e02-b743-ae78455d1827.png"
            alt={t('landing.hero.tennisCourtAlt')}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-tennis-purple-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* TENNIS BALL ANIMATION */}



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
                alt={t('landing.hero.seedLogoAlt')}
                className="h-10 w-auto"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <span className="text-2xl font-bold hidden sm:block">{t('landing.hero.innovation')}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <LanguageToggle variant="ghost" size="sm" />
              <Link to="/admin-login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 border border-white/30 transition-all duration-300"
                  >
                    {t('landing.navigation.adminLogin')}
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleGetStarted}
                  className="bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-tennis-green-400"
                >
                  {t('landing.getStarted')}
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
                <div className="flex justify-center mb-4">
                  <LanguageToggle variant="outline" size="sm" showText />
                </div>
                <Link to="/courts" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {t('landing.navigation.courts')}
                </Link>
                <Link to="/leaderboard" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {t('landing.navigation.leaderboard')}
                </Link>
                <Link to="/recordings" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {t('landing.navigation.recordings')}
                </Link>
                <Link to="/login" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {t('landing.navigation.login')}
                </Link>
                <Link to="/admin-login" className="block text-white text-lg font-medium hover:text-tennis-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {t('landing.navigation.adminAccess')}
                </Link>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleGetStarted();
                  }}
                  className="w-full bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-semibold py-3 rounded-xl"
                >
                  {t('landing.getStarted')}
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
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-lg sm:text-xl md:text-2xl text-white/80 mb-4 font-light"
              >
                {t('landing.hero.newWayOf')}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="block"
              >
                {t('landing.hero.playing')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block bg-gradient-to-r from-tennis-green-300 via-yellow-300 to-tennis-green-300 bg-clip-text text-transparent animate-glow"
              >
                {t('landing.hero.mastering')}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="block text-3xl sm:text-5xl md:text-6xl mt-4"
              >
                {t('landing.hero.analyzing')}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 text-white/90 font-medium max-w-4xl mx-auto leading-relaxed px-4"
            >
              <span className="text-2xl sm:text-3xl block mb-4">{t('landing.hero.sports')}</span>
              <span>{t('landing.hero.unleashGame')} </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="inline-block font-bold text-tennis-green-400"
              >
                {t('landing.hero.seeIt')}
              </motion.span>
              <span> </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.0, duration: 0.6 }}
                className="inline-block font-black text-yellow-400"
              >
                {t('landing.hero.seedIt')}
              </motion.span>
              <span> {t('landing.hero.it')} </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, duration: 0.6 }}
                className="inline-block font-bold text-white"
              >
                {t('landing.hero.smashIt')}
              </motion.span>
            </motion.p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in mb-8 px-4" style={{ animationDelay: '0.4s' }}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full sm:w-auto bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl rounded-2xl shadow-2xl hover:scale-110 hover:shadow-tennis-green-500/50 transition-all duration-300 transform border-2 border-tennis-green-400 glow-button"
              >
                {t('landing.hero.startFreeTrial')}
              </Button>
              <Button
                onClick={handleWatchDemo}
                size="lg"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-bold px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform"
              >
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                {t('landing.hero.watchDemo')}
              </Button>
            </div>

            {/* App Download Buttons - Below Hero CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <AppStoreButton
                  variant="playstore"
                  href="https://play.google.com/store/apps/details?id=com.devarch.tennis2&utm_source=emea_Med"
                  size="sm"
                  className="bg-black/50 backdrop-blur-md border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all duration-300"
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <AppStoreButton
                  variant="appstore"
                  href="https://apps.apple.com/app/seed-%D8%B3%D9%8A%D9%8A%D8%AF/id6754299638"
                  size="sm"
                  className="bg-black/50 backdrop-blur-md border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all duration-300"
                />
              </motion.div>
            </motion.div>

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
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-4xl mx-auto font-medium text-center">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center animate-fade-in flex flex-col items-center" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-tennis-gradient rounded-full mb-6 sm:mb-8">
                    <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="text-sm sm:text-base font-bold text-tennis-purple-600 mb-3">STEP {index + 1}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{step.title}</h3>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Smart Analysis Video Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tennis-purple-50/30 to-tennis-green-50/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              {t('landing.aiVideo.see')}{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                {t('landing.aiVideo.aiInAction')}
              </span>
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-4xl mx-auto font-medium text-center">
              {t('landing.aiVideo.subtitle')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-tennis-purple-100 to-tennis-green-100 p-4 sm:p-8">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  controls
                  poster="/lovable-uploads/9b877c55-5518-40cb-ba2c-a68fccfbe495.png"
                >
                  <source src="/seed-ia-video.mp4" type="video/mp4" />
                  {t('landing.aiVideo.browserNotSupported')}
                </video>
              </div>
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-base sm:text-lg text-gray-700 font-medium mb-4">
                  {t('landing.aiVideo.description')}
                </p>

              </div>
            </div>
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
              {t('landing.playerLevels.title')}
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 font-medium text-center max-w-4xl mx-auto">
              {t('landing.playerLevels.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {playerLevels.map((player, index) => (
              <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-8 sm:p-10 text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{player.level}</h3>
                  <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">{player.description}</p>
                  <ul className="space-y-3 sm:space-y-4 text-left">
                    {player.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-base sm:text-lg text-gray-700">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-tennis-green-500 mr-3 sm:mr-4 flex-shrink-0" />
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
            {t('landing.aiTechnology.title')}
          </h2>
          <p className="text-lg sm:text-2xl mb-8 sm:mb-12 text-white/90 font-medium max-w-5xl mx-auto leading-relaxed text-center">
            {t('landing.aiTechnology.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-12 sm:mb-16 max-w-6xl mx-auto">
            <div className="text-center p-8 sm:p-10 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <Eye className="w-16 h-16 sm:w-20 sm:h-20 text-tennis-green-300 mx-auto mb-6 sm:mb-8" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('landing.aiTechnology.computerVision.title')}</h3>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">{t('landing.aiTechnology.computerVision.description')}</p>
            </div>
            <div className="text-center p-8 sm:p-10 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <BarChart3 className="w-16 h-16 sm:w-20 sm:h-20 text-tennis-green-300 mx-auto mb-6 sm:mb-8" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('landing.aiTechnology.realTimeProcessing.title')}</h3>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">{t('landing.aiTechnology.realTimeProcessing.description')}</p>
            </div>
            <div className="text-center p-8 sm:p-10 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <Target className="w-16 h-16 sm:w-20 sm:h-20 text-tennis-green-300 mx-auto mb-6 sm:mb-8" />
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('landing.aiTechnology.precisionAnalytics.title')}</h3>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">{t('landing.aiTechnology.precisionAnalytics.description')}</p>
            </div>
          </div>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-8 sm:px-16 py-4 sm:py-6 text-lg sm:text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform hover:shadow-white/50"
          >
            {t('landing.aiTechnology.experienceTechnology')}
          </Button>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-tennis-purple-50/50 to-tennis-green-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              {t('landing.whatYouGet.title')}
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-4xl mx-auto font-medium text-center">
              {t('landing.whatYouGet.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-8 sm:p-10 text-center h-full flex flex-col">
                    <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-tennis-purple-100 to-tennis-green-100 rounded-3xl mb-6 sm:mb-8 mx-auto">
                      <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-tennis-purple-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{benefit.title}</h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed flex-1">{benefit.description}</p>
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
              {t('landing.features.title')}
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-5xl mx-auto font-medium text-center leading-relaxed">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-8 sm:p-10 text-center h-full flex flex-col">
                    <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-tennis-purple-100 to-tennis-green-100 rounded-3xl mb-6 sm:mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-tennis-purple-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{feature.title}</h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed flex-1">{feature.description}</p>
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
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-lg sm:text-2xl text-gray-600 font-medium text-center max-w-4xl mx-auto">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover h-full" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-8 sm:p-10 h-full flex flex-col">
                  <div className="flex items-center mb-6 sm:mb-8">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mr-4 sm:mr-6 border-4 border-tennis-purple-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg sm:text-xl">{testimonial.name}</h4>
                      <p className="text-gray-600 text-base sm:text-lg">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg sm:text-xl leading-relaxed mb-6 sm:mb-8 flex-1">"{testimonial.quote}"</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-tennis-purple-50/30 to-tennis-green-50/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-tennis-gradient rounded-full mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
                {t('landing.mobileApp.title')}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t('landing.mobileApp.subtitle')}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Mobile App Features */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-tennis-green-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-tennis-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.mobileApp.realTimeAnalytics.title')}</h3>
                    <p className="text-gray-600">{t('landing.mobileApp.realTimeAnalytics.description')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-tennis-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-tennis-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.mobileApp.quickBooking.title')}</h3>
                    <p className="text-gray-600">{t('landing.mobileApp.quickBooking.description')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.mobileApp.matchRecordings.title')}</h3>
                    <p className="text-gray-600">{t('landing.mobileApp.matchRecordings.description')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {t('landing.mobileApp.downloadNow')}
                </h3>
                <p className="text-gray-600 text-lg">
                  {t('landing.mobileApp.availableOn')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AppStoreButton
                    variant="playstore"
                    href="https://play.google.com/store/apps/details?id=com.devarch.tennis2&utm_source=emea_Med"
                    size="lg"
                    className="w-full sm:w-auto"
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AppStoreButton
                    variant="appstore"
                    href="https://apps.apple.com/app/seed-%D8%B3%D9%8A%D9%8A%D8%AF/id6754299638"
                    size="lg"
                    className="w-full sm:w-auto"
                  />
                </motion.div>
              </div>

              <div className="mt-6 text-center lg:text-left">
                <p className="text-sm text-gray-500">
                  <span className="inline-flex items-center">
                    <CheckCircle className="w-4 h-4 text-tennis-green-500 mr-1" />
                    {t('landing.mobileApp.freeDownload')}
                  </span>
                  <span className="mx-3">•</span>
                  <span className="inline-flex items-center">
                    <CheckCircle className="w-4 h-4 text-tennis-green-500 mr-1" />
                    {t('landing.mobileApp.noCreditCard')}
                  </span>
                </p>
              </div>
            </motion.div>
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
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg sm:text-2xl text-white/90 mb-8 sm:mb-12 font-medium max-w-4xl mx-auto leading-relaxed text-center">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full sm:w-auto bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-12 sm:px-16 py-4 sm:py-6 text-lg sm:text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform hover:shadow-white/50"
            >
              {t('landing.cta.startJourney')}
            </Button>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-br from-gray-900 via-tennis-purple-900 to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-tennis-green-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-tennis-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-white via-tennis-green-300 to-white bg-clip-text text-transparent">
              {t('landing.contact.title')}
            </h2>
            <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('landing.contact.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10"
            >
              <h3 className="text-2xl font-bold text-white mb-8">{t('landing.contact.sendMessage')}</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">{t('landing.contact.firstName')}</label>
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                      placeholder={t('landing.contact.firstNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">{t('landing.contact.lastName')}</label>
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                      placeholder={t('landing.contact.lastNamePlaceholder')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">{t('landing.contact.email')}</label>
                  <input
                    type="email"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                    placeholder={t('landing.contact.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">{t('landing.contact.subject')}</label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all"
                    placeholder={t('landing.contact.subjectPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">{t('landing.contact.message')}</label>
                  <textarea
                    rows={5}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all resize-none"
                    placeholder={t('landing.contact.tellUsNeeds')}
                  ></textarea>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-tennis-green-500/30"
                >
                  {t('landing.contact.sendMessageBtn')}
                </Button>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="text-center lg:text-left">
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  {t('landing.contact.buildFuture')}
                </h3>
                <p className="text-lg text-white/80 leading-relaxed mb-8">
                  {t('landing.contact.buildFutureDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-tennis-green-500/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-tennis-green-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{t('landing.contact.generalInquiries')}</h4>
                      <p className="text-white/70">{t('landing.contact.generalEmail')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-tennis-purple-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-tennis-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{t('landing.contact.partnerships')}</h4>
                      <p className="text-white/70">{t('landing.contact.partnershipsEmail')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{t('landing.contact.support')}</h4>
                      <p className="text-white/70">{t('landing.contact.supportEmail')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="text-center lg:text-left pt-8">
                <p className="text-white/60 text-sm">
                  {t('landing.contact.responseTime')}
                </p>
              </div>
            </motion.div>
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
                  alt={t('landing.hero.seedLogoAlt')}
                  className="h-10 sm:h-12 w-auto"
                />
                <span className="text-xl sm:text-2xl font-bold">INNOVATION</span>
              </Link>
              <p className="text-gray-400 text-base sm:text-lg mb-4 sm:mb-6 max-w-md">
                {t('landing.footer.description')}
              </p>

              {/* Mobile App Download */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">{t('landing.footer.downloadMobileApp')}</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <AppStoreButton
                    variant="playstore"
                    href="https://play.google.com/store/apps/details?id=com.devarch.tennis2&utm_source=emea_Med"
                    size="sm"
                    className="bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-500"
                  />
                  <AppStoreButton
                    variant="appstore"
                    href="https://apps.apple.com/app/seed-%D8%B3%D9%8A%D9%8A%D8%AF/id6754299638"
                    size="sm"
                    className="bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <a
                  href="https://x.com/seed_innov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-tennis-purple-600 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm">𝕏</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/seed-innovation-1/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-tennis-purple-600 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm">in</span>
                </a>
              </div>
            </div>
            <div>

              <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link to="/courts" className="hover:text-white transition-colors">{t('landing.footer.bookCourts')}</Link></li>
                <li><Link to="/recordings" className="hover:text-white transition-colors">{t('landing.footer.matchAnalysis')}</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">{t('landing.footer.leaderboards')}</Link></li>
                <li><Link to="/subscription" className="hover:text-white transition-colors">{t('landing.footer.pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('landing.footer.support')}</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><button onClick={() => toast.info(t('landing.footer.helpCenterSoon'))} className="hover:text-white transition-colors text-left">{t('landing.footer.helpCenter')}</button></li>
                <li><button onClick={() => toast.info(t('landing.footer.contactFormSoon'))} className="hover:text-white transition-colors text-left">{t('landing.footer.contactUs')}</button></li>
                <li><button onClick={() => toast.info(t('landing.footer.privacySoon'))} className="hover:text-white transition-colors text-left">{t('landing.footer.privacyPolicy')}</button></li>
                <li><button onClick={() => toast.info(t('landing.footer.termsSoon'))} className="hover:text-white transition-colors text-left">{t('landing.footer.termsOfService')}</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
