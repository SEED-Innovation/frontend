
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Calendar, Star, Eye } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 tennis-gradient opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        </div>

        {/* Floating Tennis Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-white/20 rounded-full animate-tennis-bounce" />
        <div className="absolute top-40 right-20 w-12 h-12 bg-white/15 rounded-full animate-tennis-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/10 rounded-full animate-tennis-bounce" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Start your{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
              TENNIS
            </span>{' '}
            Journey
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            AI-powered session tracking, analytics, and coaching insights
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/register">
              <Button size="lg" className="bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-8 py-4 text-lg rounded-xl shadow-2xl hover:scale-105 transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-tennis-purple-700 font-bold px-8 py-4 text-lg rounded-xl border-2">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">10K+</div>
              <div className="text-white/80">Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">500+</div>
              <div className="text-white/80">Courts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">1M+</div>
              <div className="text-white/80">Sessions</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powered by AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of tennis training with our cutting-edge platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="court-card p-8 text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 tennis-gradient rounded-2xl mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Players
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="court-card p-8 animate-fade-in" style={{ animationDelay: `${index * 0.3}s` }}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                  <div className="flex mt-4">
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
      <section className="py-20 tennis-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of players already using SEED to improve their tennis
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-tennis-purple-700 hover:bg-gray-100 font-bold px-12 py-4 text-lg rounded-xl shadow-2xl hover:scale-105 transition-all duration-300">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
