
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Subscription = () => {
  const { t } = useTranslation('web');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    
    toast.success(t('messages.info'));
    
    // Simulate payment process
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      toast.success(t('messages.success'));
    }, 2000);
  };

  const handleGetStarted = () => {
    toast.info(t('messages.info'));
    setTimeout(() => window.location.href = '/dashboard', 500);
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
                  {t('subscription.welcomeToPremium')}
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  {t('subscription.subscriptionActive')}
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-tennis-green-50 rounded-xl">
                    <h3 className="font-semibold text-tennis-green-700 mb-2">{t('subscription.whatsNext')}</h3>
                    <ul className="text-sm text-tennis-green-600 space-y-1">
                      {(t('subscription.nextSteps', { returnObjects: true }) as string[]).map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button 
                    onClick={handleGetStarted}
                    className="tennis-button"
                  >
                    {t('subscription.getStarted')}
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="outline" className="btn-outline w-full sm:w-auto">
                      {t('subscription.goToDashboard')}
                    </Button>
                  </Link>
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
          <SubscriptionPlans 
            onPlanSelect={handlePlanSelect} 
            isLoading={isLoading}
            selectedPlan={selectedPlan}
          />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
