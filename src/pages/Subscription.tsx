
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);
    
    // Simulate payment processing
    toast({
      title: "Processing Payment",
      description: "Please wait while we process your subscription...",
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Welcome to SEED Premium! Your subscription is now active.",
      });
    }, 2000);
  };

  const handleBackToDashboard = () => {
    setShowSuccess(false);
    // In a real app, this would navigate to dashboard
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="premium-card text-center animate-scale-in">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-tennis-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-tennis-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to SEED Premium!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Your subscription is now active. Start exploring all the premium features.
                </p>
                <div className="space-y-6">
                  <div className="p-6 bg-tennis-green-50 rounded-xl">
                    <h3 className="font-semibold text-tennis-green-700 mb-3">What's next?</h3>
                    <ul className="text-sm text-tennis-green-600 space-y-2 text-left">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Book your first AI-powered session
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Explore advanced analytics features
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Download unlimited match recordings
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Access exclusive community challenges
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/dashboard">
                      <Button className="tennis-button w-full sm:w-auto">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link to="/courts">
                      <Button variant="outline" className="btn-outline w-full sm:w-auto">
                        Book Your First Court
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Link to="/dashboard" className="inline-flex items-center text-tennis-purple-600 hover:text-tennis-purple-700 mb-6 animated-underline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock the full potential of your tennis game with our premium features
            </p>
          </div>

          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="premium-card p-8">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-tennis-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
                  <p className="text-gray-600">Please wait while we set up your subscription...</p>
                </div>
              </Card>
            </div>
          )}

          <SubscriptionPlans onPlanSelect={handlePlanSelect} />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
