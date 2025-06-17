
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, Trophy, Camera, BarChart3, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Landing = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleWatchDemo = () => {
    setIsVideoModalOpen(true);
  };

  const handleCloseVideo = () => {
    setIsVideoModalOpen(false);
  };

  const features = [
    {
      icon: Camera,
      title: "AI-Powered Recording",
      description: "Advanced court cameras capture every shot with precision analysis"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Detailed insights into your game with actionable improvement suggestions"
    },
    {
      icon: Users,
      title: "Community Challenges",
      description: "Compete with players worldwide and climb the global leaderboards"
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock badges and track your tennis journey milestones"
    }
  ];

  const howItWorksSteps = [
    {
      step: "1",
      title: "Book Your Court",
      description: "Reserve AI-enabled courts at partner facilities worldwide",
      icon: "🎾"
    },
    {
      step: "2", 
      title: "Play & Record",
      description: "Our smart cameras automatically capture your entire match",
      icon: "📹"
    },
    {
      step: "3",
      title: "AI Analysis",
      description: "Advanced algorithms analyze technique, strategy, and performance",
      icon: "🤖"
    },
    {
      step: "4",
      title: "View Progress",
      description: "Access detailed reports and share highlights with friends",
      icon: "📈"
    }
  ];

  const playerLevels = [
    {
      level: "Beginner",
      description: "Perfect for new players learning the fundamentals",
      features: ["Basic stroke analysis", "Technique tips", "Progress tracking"],
      color: "bg-tennis-green-100 text-tennis-green-700"
    },
    {
      level: "Amateur",
      description: "For recreational players looking to improve their game",
      features: ["Advanced analytics", "Match strategy insights", "Performance comparisons"],
      color: "bg-tennis-purple-100 text-tennis-purple-700"
    },
    {
      level: "Professional",
      description: "Elite-level analysis for competitive players",
      features: ["Pro-level metrics", "Tournament preparation", "Coach collaboration"],
      color: "bg-yellow-100 text-yellow-700"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Club Player",
      content: "SEED has revolutionized how I train. The AI insights helped me improve my backhand by 40% in just two months!",
      rating: 5
    },
    {
      name: "Miguel Rodriguez",
      role: "Tennis Coach",
      content: "The detailed analytics give me and my students incredible insights. It's like having a data scientist on court.",
      rating: 5
    },
    {
      name: "Emma Chen",
      role: "Tournament Player",
      content: "The video analysis and performance tracking features are game-changers for competitive preparation.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/lovable-uploads/79b783b6-41ce-4e02-b743-ae78455d1827.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 container-responsive text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-responsive-3xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Elevate Your Tennis Game with <span className="tennis-gradient bg-clip-text text-transparent">AI Intelligence</span>
            </h1>
            <p className="text-responsive-lg md:text-2xl lg:text-3xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Record, analyze, and improve your tennis performance with cutting-edge AI technology and comprehensive court booking system.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/register">
                <Button className="tennis-button text-lg px-8 py-4 w-full sm:w-auto min-w-[200px] interactive-hover">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                onClick={handleWatchDemo}
                variant="outline" 
                className="text-lg px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 w-full sm:w-auto min-w-[200px] interactive-hover"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How SEED Works */}
      <section className="spacing-responsive-lg bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">How SEED Works</h2>
            <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
              Our innovative four-step process transforms your tennis experience through intelligent technology
            </p>
          </div>
          
          <div className="responsive-grid">
            {howItWorksSteps.map((step, index) => (
              <Card key={index} className="premium-card text-center group">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="w-12 h-12 tennis-gradient rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Player Levels */}
      <section className="spacing-responsive-lg">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">Designed for Every Player Level</h2>
            <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
              Whether you're picking up a racket for the first time or competing professionally, SEED adapts to your skill level
            </p>
          </div>
          
          <div className="responsive-grid">
            {playerLevels.map((level, index) => (
              <Card key={index} className="premium-card group">
                <CardContent className="p-8">
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${level.color}`}>
                    {level.level}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{level.level}</h3>
                  <p className="text-gray-600 mb-6">{level.description}</p>
                  <ul className="space-y-2">
                    {level.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 text-tennis-green-500 mr-2 flex-shrink-0" />
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

      {/* AI Technology */}
      <section className="spacing-responsive-lg bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">Powered by Advanced AI</h2>
            <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
              Our cutting-edge artificial intelligence provides unprecedented insights into your tennis performance
            </p>
          </div>
          
          <div className="responsive-grid">
            {features.map((feature, index) => (
              <Card key={index} className="premium-card group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 tennis-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="spacing-responsive-lg">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">Everything You Need to Excel</h2>
            <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features designed to accelerate your tennis improvement journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              "Automated match statistics and shot analysis",
              "High-quality video storage and highlights",
              "Performance badges and achievement system", 
              "Global community and leaderboards",
              "Personalized coaching recommendations",
              "Court booking and session management",
              "Advanced analytics dashboard",
              "Progress tracking and goal setting",
              "Social sharing and community features"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                <CheckCircle className="w-6 h-6 text-tennis-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="spacing-responsive-lg bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">Trusted by Tennis Players Worldwide</h2>
            <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
              Join thousands of players who have transformed their game with SEED
            </p>
          </div>
          
          <div className="responsive-grid">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="premium-card">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="spacing-responsive-lg tennis-gradient">
        <div className="container-responsive text-center">
          <h2 className="text-responsive-2xl font-bold text-white mb-6">Ready to Transform Your Tennis Game?</h2>
          <p className="text-responsive-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join the tennis revolution. Start your free trial today and experience the future of tennis training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-white text-tennis-purple-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 text-lg w-full sm:w-auto min-w-[200px]">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/courts">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 text-lg w-full sm:w-auto min-w-[200px]">
                Find Courts Near You
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">SEED Tennis Demo</h3>
              <Button onClick={handleCloseVideo} variant="ghost" className="text-gray-500 hover:text-gray-700">
                ✕
              </Button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Demo video coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Landing;
