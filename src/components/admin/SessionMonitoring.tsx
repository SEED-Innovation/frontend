
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Users, MapPin, Activity } from 'lucide-react';
import { toast } from 'sonner';

const SessionMonitoring = () => {
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Mock session data
  const liveSessions = [
    {
      id: 'session_001',
      courtName: 'Riverside Tennis Club - Court 1',
      players: ['John Doe', 'Jane Smith'],
      startTime: '14:30',
      duration: '45 min',
      status: 'live',
      location: 'Downtown',
      aiStatus: 'processing'
    },
    {
      id: 'session_002',
      courtName: 'Elite Tennis Academy - Court 3',
      players: ['Mike Johnson'],
      startTime: '15:15',
      duration: '30 min',
      status: 'live',
      location: 'Uptown',
      aiStatus: 'active'
    }
  ];

  const pastSessions = [
    {
      id: 'session_100',
      courtName: 'Grand Slam Center - Court 2',
      players: ['Alice Brown', 'Bob Wilson'],
      date: 'Today, 12:00 PM',
      duration: '90 min',
      status: 'completed',
      processed: true,
      insights: 245
    },
    {
      id: 'session_101',
      courtName: 'Tennis Pro Academy - Court 1',
      players: ['Charlie Davis'],
      date: 'Today, 10:30 AM',
      duration: '60 min',
      status: 'completed',
      processed: true,
      insights: 189
    }
  ];

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    toast.info(`Viewing session ${session.id}`);
  };

  const handleForceProcess = (sessionId: string) => {
    toast.success(`Forced reprocessing of session ${sessionId}`);
  };

  return (
    <div className="space-y-6">
      {/* Live Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-tennis-green-600" />
            Live Sessions ({liveSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{session.courtName}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {session.location}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-tennis-green-100 text-tennis-green-700">
                      Live
                    </Badge>
                    <Badge variant="outline" className={
                      session.aiStatus === 'active' 
                        ? 'border-tennis-green-500 text-tennis-green-700'
                        : 'border-yellow-500 text-yellow-700'
                    }>
                      AI: {session.aiStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    {session.players.join(', ')}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    Started: {session.startTime}
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity className="w-4 h-4 mr-2 text-gray-500" />
                    Duration: {session.duration}
                  </div>
                  <div className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewSession(session)}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{session.courtName}</h4>
                    <p className="text-sm text-gray-600">{session.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-700">
                      Completed
                    </Badge>
                    {session.processed && (
                      <Badge className="bg-tennis-green-100 text-tennis-green-700">
                        Processed
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    {session.players.join(', ')}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {session.duration}
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity className="w-4 h-4 mr-2 text-gray-500" />
                    {session.insights} insights
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewSession(session)}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleForceProcess(session.id)}
                      className="text-xs"
                    >
                      Reprocess
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionMonitoring;
