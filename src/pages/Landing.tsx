
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Calendar, Star, Eye, Trophy, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Landing = () => {
  const features = [
    {
      icon: Eye,
      title: "AI-Powered Tracking",
      description: "Advanced computer vision analyzes your game in real-time"
    },
    {
      icon: Calendar,
      title: "Smart Court Booking",
      description: "Find and book courts with integrated technology features"
    },
    {
      icon: Star,
      title: "Performance Analytics",
      description: "Detailed insights to improve your tennis skills"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tennis Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=64&h=64&fit=crop&crop=face",
      quote: "SEED transformed how I track my progress. The AI coaching is incredible!"
    },
    {
      name: "Marcus Johnson",
      role: "Club Player",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      quote: "Finding courts with AI tracking has never been easier. Game changer!"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background with Tennis Elements */}
        <div className="absolute inset-0">
          {/* Animated gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-tennis-purple-900 via-tennis-purple-600 to-tennis-green-600 animate-pulse" />
          
          {/* Glowing mesh overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-96 h-96 bg-tennis-green-400 rounded-full mix-blend-multiply filter blur-xl animate-tennis-bounce opacity-70" />
            <div className="absolute top-40 right-20 w-80 h-80 bg-tennis-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-tennis-bounce opacity-70" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-tennis-bounce opacity-70" style={{ animationDelay: '2s' }} />
          </div>

          {/* Tennis court line patterns */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 800 600">
              <defs>
                <pattern id="court-lines" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                  <rect width="200" height="200" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeWidth="1" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#court-lines)" />
            </svg>
          </div>

          {/* Floating tennis elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-tennis-bounce backdrop-blur-sm border border-white/20" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-white/15 rounded-full animate-tennis-bounce backdrop-blur-sm border border-white/20" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/10 rounded-full animate-tennis-bounce backdrop-blur-sm border border-white/20" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-10 w-14 h-14 bg-tennis-green-400/20 rounded-full animate-tennis-bounce backdrop-blur-sm border border-tennis-green-400/30" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          {/* Main Headlines */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 animate-fade-in leading-tight">
            <span className="block">Book. Play.</span>
            <span className="block bg-gradient-to-r from-tennis-green-300 via-yellow-300 to-tennis-green-300 bg-clip-text text-transparent animate-glow">
              Improve.
            </span>
            <span className="block text-5xl md:text-6xl mt-2">With AI.</span>
          </h1>
          
          <p className="text-2xl md:text-3xl mb-12 text-white/90 animate-fade-in font-medium max-w-4xl mx-auto leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Smash your limits. AI-powered court booking, stats & match recordings.
          </p>

          {/* CTA Buttons - Always Visible */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in mb-16" style={{ animationDelay: '0.4s' }}>
            <Link to="/register">
              <Button size="lg" className="bg-tennis-green-500 hover:bg-tennis-green-400 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:scale-110 hover:shadow-tennis-green-500/50 transition-all duration-300 transform hover:animate-glow border-2 border-tennis-green-400">
                <Play className="w-6 h-6 mr-3" />
                Try Now
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform">
                <Trophy className="w-6 h-6 mr-3" />
                See Leaderboard
              </Button>
            </Link>
          </div>

          {/* Demo Video Placeholder */}
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="relative max-w-4xl mx-auto">
              <div className="glass-card rounded-3xl p-2 shadow-2xl">
                <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-tennis-purple-600/50 to-tennis-green-600/50" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white/80 text-lg">Watch SEED in Action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black mb-2">10K+</div>
              <div className="text-white/80 text-lg">Players</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black mb-2">500+</div>
              <div className="text-white/80 text-lg">Courts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black mb-2">1M+</div>
              <div className="text-white/80 text-lg">Sessions</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-8 h-8 text-white/60" />
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Powered by{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                AI Technology
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Experience the future of tennis training with our cutting-edge platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="glass-card p-8 text-center animate-fade-in hover:scale-105 transition-all duration-500 hover:shadow-2xl border-0 group" style={{ animationDelay: `${index * 0.2}s` }}>
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 tennis-gradient rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{feature.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Loved by{' '}
              <span className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
                Players
              </span>
            </h2>
            <p className="text-2xl text-gray-600 font-medium">
              See what our community has to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card p-10 animate-fade-in hover:scale-105 transition-all duration-500 hover:shadow-2xl border-0" style={{ animationDelay: `${index * 0.3}s` }}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-8">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-6 border-4 border-tennis-purple-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">"{testimonial.quote}"</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 tennis-gradient">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-2xl text-white/90 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
            Join thousands of players already using SEED to improve their tennis
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-16 py-6 text-2xl rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 transform hover:shadow-white/50">
              <Play className="w-8 h-8 mr-4" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
