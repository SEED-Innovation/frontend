
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Server, Cpu, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const SystemMetrics = () => {
  // Mock system metrics data
  const systemHealth = {
    uptime: 99.8,
    avgLatency: 8.5,
    activeCameras: 156,
    totalCameras: 160,
    processingQueue: 3,
    errorRate: 0.2
  };

  const performanceMetrics = [
    { name: 'API Response Time', value: '245ms', status: 'good', trend: 'up' },
    { name: 'Video Processing Time', value: '12.3s', status: 'good', trend: 'down' },
    { name: 'AI Model Inference', value: '3.1s', status: 'excellent', trend: 'down' },
    { name: 'Storage Usage', value: '67%', status: 'warning', trend: 'up' }
  ];

  const recentIssues = [
    {
      id: 'issue_001',
      type: 'camera',
      message: 'Camera offline at Riverside Tennis Club - Court 2',
      timestamp: '2 minutes ago',
      severity: 'high'
    },
    {
      id: 'issue_002',
      type: 'processing',
      message: 'High processing latency detected',
      timestamp: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 'issue_003',
      type: 'storage',
      message: 'Storage approaching 70% capacity',
      timestamp: '1 hour ago',
      severity: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-tennis-green-700 bg-tennis-green-100';
      case 'good': return 'text-blue-700 bg-blue-100';
      case 'warning': return 'text-yellow-700 bg-yellow-100';
      case 'error': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-tennis-green-600" />
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tennis-green-600 mb-2">
              {systemHealth.uptime}%
            </div>
            <Progress value={systemHealth.uptime} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {systemHealth.avgLatency}s
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-1 text-tennis-green-500" />
              12% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Server className="w-5 h-5 mr-2 text-tennis-purple-600" />
              Active Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tennis-purple-600 mb-2">
              {systemHealth.activeCameras}/{systemHealth.totalCameras}
            </div>
            <Progress value={(systemHealth.activeCameras / systemHealth.totalCameras) * 100} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">Online cameras</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-tennis-purple-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                  <TrendingUp className={`w-4 h-4 ${
                    metric.trend === 'up' ? 'text-red-500 rotate-0' : 'text-tennis-green-500 rotate-180'
                  }`} />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{metric.name}</h4>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Recent Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity}
                  </Badge>
                  <div>
                    <p className="font-medium text-gray-900">{issue.message}</p>
                    <p className="text-sm text-gray-600">{issue.timestamp}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-tennis-purple-600 hover:text-tennis-purple-700 text-sm font-medium">
                    Investigate
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMetrics;
