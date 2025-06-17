
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Calendar, Star, Eye, Trophy, Play, Zap, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Landing = () => {
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
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-tennis-purple-900 via-tennis-purple-700 to-tennis-green-600" />
          
          {/* Animated mesh overlay */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-10 left-10 w-96 h-96 bg-tennis-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-tennis-bounce opacity-70" />
            <div className="absolute top-40 right-20 w-80 h-80 bg-tennis-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-tennis-bounce opacity-70" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-tennis-bounce opacity-70" style={{ animationDelay: '2s' }} />
          </div>

          {/* Court pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 800 600">
              <defs>
                <pattern id="court-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="none" stroke="white" strokeWidth="1" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#court-lines)" />
            </svg>
          </div>

          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-tennis-bounce backdrop-blur-sm border border-white/20" />
          <div className="absolute top-60 right-32 w-12 h-12 bg-white/15 rounded-full animate-tennis-bounce backdrop-blur-sm border border-white/20" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/10 rounded-full animate-tennis-bounce backdrop-blur-sm border border-white/20" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-7xl mx-auto">
          {/* Navigation */}
          <nav className="absolute top-8 left-0 right-0 flex items-center justify-between px-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold">SEED</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/login" className="text-white/80 hover:text-white transition-colors">Login</Link>
              <Link to="/register">
                <Button className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <div className="pt-32">
            <h1 className="text-6xl md:text-8xl font-black mb-8 animate-fade-in leading-tight">
              <span className="block">Smash.</span>
              <span className="block bg-gradient-to-r from-tennis-green-300 via-yellow-300 to-tennis-green-300 bg-clip-text text-transparent animate-glow">
                Analyze.
              </span>
              <span className="block text-5xl md:text-6xl mt-4">Evolve.</span>
            </h1>
            
            <p className="text-2xl md:text-3xl mb-12 text-white/90 animate-fade-in font-medium max-w-4xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
              AI-powered tennis reimagined. Instant match analysis, smart court booking, and performance insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in mb-16" style={{ animationDelay: '0.4s' }}>
              <Link to="/register">
                <Button size="lg" className="bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:scale-110 hover:shadow-tennis-green-500/50 transition-all duration-300 transform border-2 border-tennis-green-400 glow-button">
                  <Play className="w-6 h-6 mr-3" />
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="lg" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform">
                  <Trophy className="w-6 h-6 mr-3" />
                  View Leaderboard
                </Button>
              </Link>
            </div>

            {/* Demo Video */}
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="relative max-w-5xl mx-auto">
                <div className="glass-card rounded-3xl p-4 shadow-2xl">
                  <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-tennis-purple-600/50 to-tennis-green-600/50" />
                    <div className="relative z-10 text-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm hover:scale-110 transition-transform duration-300 cursor-pointer">
                        <Play className="w-12 h-12 text-white ml-1" />
                      </div>
                      <p className="text-white/80 text-xl font-medium">Watch SEED in Action</p>
                      <p className="text-white/60 text-sm mt-2">See how AI transforms tennis analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-black mb-2">{stat.number}</div>
                  <div className="text-white/80 text-lg">{stat.label}</div>
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

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-tennis-purple-50/50 to-tennis-green-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Powered by{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                AI Excellence
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Advanced computer vision and machine learning deliver insights that transform your game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 tennis-gradient rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-tennis-purple-100 rounded-full filter blur-3xl opacity-30" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-tennis-green-100 rounded-full filter blur-3xl opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                Champions
              </span>
            </h2>
            <p className="text-2xl text-gray-600 font-medium">
              See what tennis professionals and enthusiasts are saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="premium-card border-0 animate-fade-in interactive-hover" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-tennis-purple-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">"{testimonial.quote}"</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 tennis-gradient">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            Ready to Transform Your Game?
          </h2>
          <p className="text-2xl text-white/90 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
            Join thousands of players already using SEED to reach their full potential
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-16 py-6 text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform hover:shadow-white/50">
                <Play className="w-8 h-8 mr-4" />
                Start Your Journey
              </Button>
            </Link>
            <Link to="/courts">
              <Button size="lg" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 font-bold px-16 py-6 text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform">
                <Eye className="w-8 h-8 mr-4" />
                Find Courts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 tennis-gradient rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold">SEED</span>
              </div>
              <p className="text-gray-400 text-lg mb-6">
                AI-powered tennis analytics platform helping players and coaches achieve excellence through data-driven insights.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-tennis-purple-600 transition-colors cursor-pointer">
                  <span className="text-sm">𝕏</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-tennis-purple-600 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courts" className="hover:text-white transition-colors">Book Courts</Link></li>
                <li><Link to="/recordings" className="hover:text-white transition-colors">Match Analysis</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboards</Link></li>
                <li><Link to="/subscription" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SEED. All rights reserved. Built for the future of tennis.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
