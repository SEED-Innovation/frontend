
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recording } from '@/types/recordings';

interface PerformanceStatsProps {
  recording: Recording;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ recording }) => {
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-tennis-purple-600" />
          Performance Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="stats-card">
          <div className="text-3xl font-bold text-tennis-purple-700">
            {recording.stats.serves}
          </div>
          <div className="text-sm text-gray-600">Total Serves</div>
        </div>
        
        <div className="stats-card">
          <div className="text-3xl font-bold text-tennis-green-700">
            {recording.stats.serveAccuracy}%
          </div>
          <div className="text-sm text-gray-600">Serve Accuracy</div>
        </div>
        
        <div className="stats-card">
          <div className="text-3xl font-bold text-blue-700">
            {recording.stats.avgSpeed} mph
          </div>
          <div className="text-sm text-gray-600">Avg Speed</div>
        </div>
        
        <div className="stats-card">
          <div className="text-3xl font-bold text-yellow-700">
            {recording.stats.winners}
          </div>
          <div className="text-sm text-gray-600">Winners</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceStats;
