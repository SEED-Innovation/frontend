
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        // Mock login validation
        if (formData.email && formData.password) {
          toast({
            title: "Login Successful",
            description: "Welcome back to SEED Tennis!",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Login Failed",
            description: "Please enter valid credentials.",
            variant: "destructive"
          });
        }
      } else {
        // Mock registration validation
        if (formData.email && formData.password && formData.fullName && formData.password === formData.confirmPassword) {
          toast({
            title: "Registration Successful",
            description: "Welcome to SEED Tennis! Please check your email to verify your account.",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Registration Failed",
            description: "Please fill all fields correctly and ensure passwords match.",
            variant: "destructive"
          });
        }
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleGuestAccess = () => {
    toast({
      title: "Guest Access",
      description: "Welcome to SEED Tennis! You can explore limited features as a guest.",
    });
    navigate('/dashboard');
  };

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: `${provider} Login`,
        description: `Successfully logged in with ${provider}!`,
      });
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img 
              src="/lovable-uploads/9b877c55-5518-40cb-ba2c-a68fccfbe495.png" 
              alt="SEED Logo" 
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold text-gray-900">SEED</span>
          </Link>
        </div>

        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              {isLogin ? 'Welcome Back' : 'Join SEED Tennis'}
            </CardTitle>
            <p className="text-center text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="form-label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="tennis-button w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleSocialAuth('Google')}
                variant="outline"
                className="w-full btn-outline"
                disabled={isLoading}
              >
                Continue with Google
              </Button>
              <Button
                onClick={() => handleSocialAuth('Apple')}
                variant="outline"
                className="w-full btn-outline"
                disabled={isLoading}
              >
                Continue with Apple
              </Button>
              <Button
                onClick={handleGuestAccess}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Continue as Guest
              </Button>
            </div>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-tennis-purple-600 hover:text-tennis-purple-700 font-medium animated-underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
              {isLogin && (
                <div>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-gray-600 hover:text-tennis-purple-600 animated-underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
