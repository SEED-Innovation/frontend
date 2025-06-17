
import React from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AIInsights: React.FC = () => {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="w-5 h-5 mr-2 text-tennis-purple-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-tennis-green-50 rounded-xl">
          <p className="text-sm text-tennis-green-700 font-medium">
            Great serve consistency in this match!
          </p>
        </div>
        <div className="p-3 bg-tennis-purple-50 rounded-xl">
          <p className="text-sm text-tennis-purple-700 font-medium">
            Consider working on backhand placement
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700 font-medium">
            Excellent net play improvement
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
