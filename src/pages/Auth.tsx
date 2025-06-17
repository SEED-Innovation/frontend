
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { isLogin, formData });
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    console.log('Starting authentication...');
    
    // Simulate authentication process
    setTimeout(() => {
      setIsLoading(false);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      console.log('Navigating to dashboard...');
      navigate('/dashboard');
    }, 1500);
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`Social auth clicked: ${provider}`);
    setIsLoading(true);
    toast.success(`Signing in with ${provider}...`);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const handleGuestMode = () => {
    console.log('Guest mode clicked');
    toast.info('Entering guest mode...');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  const handleToggleMode = () => {
    console.log('Toggle mode clicked', { currentMode: isLogin });
    setIsLogin(!isLogin);
  };

  const handleTogglePassword = () => {
    console.log('Toggle password clicked');
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-purple-50 via-white to-tennis-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 tennis-gradient rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
              SEED
            </span>
          </Link>
        </div>

        <Card className="bg-white shadow-lg border border-gray-200 rounded-lg animate-fade-in relative">
          <CardHeader className="text-center p-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your SEED account' : 'Join the SEED tennis community'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50 relative z-20"
                disabled={isLoading}
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 mr-3" />
                Continue with Google
              </Button>
              <Button
                type="button"
                onClick={() => handleSocialAuth('Apple')}
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50 relative z-20"
                disabled={isLoading}
              >
                <span className="mr-3">🍎</span>
                Continue with Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-purple-500 focus:border-transparent mt-1"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-purple-500 focus:border-transparent mt-1"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-30"
                    onClick={handleTogglePassword}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-purple-500 focus:border-transparent mt-1"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-tennis-purple-600 hover:text-tennis-purple-700 underline relative z-20"
                    onClick={() => toast.info('Password reset coming soon!')}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 hover:from-tennis-purple-700 hover:to-tennis-green-600 text-white w-full h-12 relative z-20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            {/* Switch Mode */}
            <div className="text-center relative z-20">
              <span className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-tennis-purple-600 hover:text-tennis-purple-700 font-medium underline"
                disabled={isLoading}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            {/* Guest Mode */}
            <div className="text-center pt-4 border-t border-gray-200 relative z-20">
              <Button 
                type="button"
                variant="ghost" 
                className="text-gray-600 hover:text-gray-800 relative z-20"
                onClick={handleGuestMode}
                disabled={isLoading}
              >
                Continue as Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
