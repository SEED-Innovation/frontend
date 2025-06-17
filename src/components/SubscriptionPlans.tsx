
import React, { useState } from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubscriptionPlansProps {
  onPlanSelect: (plan: string) => void;
  isLoading?: boolean;
  selectedPlan?: string | null;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  onPlanSelect, 
  isLoading = false, 
  selectedPlan = null 
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Seed Basic',
      id: 'basic',
      icon: Star,
      monthlyPrice: 15,
      yearlyPrice: 150,
      description: 'Perfect for casual players',
      features: [
        'Court booking system',
        'Basic session tracking',
        'Match history (last 10)',
        'Community leaderboard',
        'Standard support'
      ],
      limitations: [
        'Limited AI features',
        'No video downloads',
        'Basic analytics only'
      ],
      popular: false,
      color: 'tennis-green'
    },
    {
      name: 'Seed Premium',
      id: 'premium',
      icon: Crown,
      monthlyPrice: 35,
      yearlyPrice: 350,
      description: 'For serious tennis enthusiasts',
      features: [
        'Everything in Basic',
        'Full AI analytics suite',
        'Unlimited video downloads',
        'Advanced performance insights',
        '3D shot visualization',
        'Personal AI coach',
        'Priority court booking',
        'Premium support',
        'Custom training plans'
      ],
      limitations: [],
      popular: true,
      color: 'tennis-purple'
    }
  ];

  const currentPrice = (plan: typeof plans[0]) => 
    billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  const savings = (plan: typeof plans[0]) => 
    plan.monthlyPrice * 12 - plan.yearlyPrice;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Tennis Journey
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Unlock your potential with AI-powered tennis training
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              billingCycle === 'monthly'
                ? 'bg-white text-tennis-purple-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              billingCycle === 'yearly'
                ? 'bg-white text-tennis-purple-700 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <Badge className="ml-2 bg-tennis-green-100 text-tennis-green-700">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          const isPopular = plan.popular;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <Card 
              key={plan.id}
              className={`premium-card relative animate-fade-in ${
                isPopular ? 'ring-2 ring-tennis-purple-300 scale-105' : ''
              } ${isSelected ? 'ring-2 ring-tennis-green-500' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-tennis-purple-500 text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  plan.color === 'tennis-purple' 
                    ? 'bg-tennis-purple-100' 
                    : 'bg-tennis-green-100'
                }`}>
                  <IconComponent className={`w-8 h-8 ${
                    plan.color === 'tennis-purple' 
                      ? 'text-tennis-purple-600' 
                      : 'text-tennis-green-600'
                  }`} />
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">
                    ${currentPrice(plan)}
                    <span className="text-lg text-gray-500 font-normal">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  
                  {billingCycle === 'yearly' && savings(plan) > 0 && (
                    <div className="text-tennis-green-600 font-medium">
                      Save ${savings(plan)} annually
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Included Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-tennis-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => onPlanSelect(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-4 text-lg font-semibold glow-button ${
                    isPopular
                      ? 'tennis-button'
                      : 'btn-outline'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading && isSelected ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : isPopular ? (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Start Free Trial
                    </>
                  ) : (
                    'Choose Plan'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {isPopular ? '14-day free trial • Cancel anytime' : 'No setup fees • Cancel anytime'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Need help choosing? Compare all features side by side
        </p>
        <Button variant="outline" className="btn-outline">
          View Detailed Comparison
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
