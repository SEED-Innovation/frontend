
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';

const Session = () => {
  const [sessionState, setSessionState] = useState<'ready' | 'active' | 'paused' | 'completed'>('ready');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === 'active') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setSessionState('active');
    setIsRecording(true);
  };

  const handlePauseSession = () => {
    setSessionState('paused');
    setIsRecording(false);
  };

  const handleResumeSession = () => {
    setSessionState('active');
    setIsRecording(true);
  };

  const handleEndSession = () => {
    setSessionState('completed');
    setIsRecording(false);
  };

  const sessionInfo = {
    court: "Riverside Tennis Club",
    date: "Today, Dec 17, 2025",
    time: "2:00 PM - 4:00 PM",
    type: "Practice Session"
  };

  const stats = [
    { label: "Shots Tracked", value: sessionState === 'ready' ? "0" : "127" },
    { label: "Accuracy", value: sessionState === 'ready' ? "0%" : "78%" },
    { label: "Speed (avg)", value: sessionState === 'ready' ? "0 mph" : "45 mph" },
    { label: "Score", value: sessionState === 'ready' ? "0-0" : "6-4" }
  ];

  if (sessionState === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Completion Animation */}
            <div className="text-center mb-8 animate-scale-in">
              <div className="w-24 h-24 tennis-gradient rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Session Complete!</h1>
              <p className="text-xl text-gray-600">Great job on your tennis session</p>
            </div>

            {/* Session Summary */}
            <Card className="court-card mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Session Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-tennis-purple-700">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{formatTime(timeElapsed)}</div>
                  <div className="text-gray-600">Total Duration</div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="tennis-button">
                View Full Analysis
              </Button>
              <Button size="lg" variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                Share Results
              </Button>
              <Button size="lg" variant="outline" className="border-tennis-purple-200 text-tennis-purple-700">
                Book Another Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Session Info */}
          <Card className="court-card mb-8 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{sessionInfo.court}</h1>
                  <div className="flex items-center text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {sessionInfo.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {sessionInfo.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">{sessionInfo.type}</div>
                  <div className={`flex items-center ${isRecording ? 'text-red-600' : 'text-gray-500'}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      {isRecording ? 'Recording' : 'Not Recording'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Timer */}
          <Card className="court-card mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <div className="text-6xl md:text-8xl font-bold text-gray-900 mb-4 font-mono">
                  {formatTime(timeElapsed)}
                </div>
                <Progress 
                  value={sessionState === 'ready' ? 0 : (timeElapsed / 7200) * 100} 
                  className="h-2 mb-4"
                />
                <div className="text-lg text-gray-600">
                  {sessionState === 'ready' && 'Ready to start your session'}
                  {sessionState === 'active' && 'Session in progress'}
                  {sessionState === 'paused' && 'Session paused'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {sessionState === 'ready' && (
                  <Button size="lg" onClick={handleStartSession} className="tennis-button px-8 py-4">
                    <Play className="w-6 h-6 mr-2" />
                    Start Session
                  </Button>
                )}
                
                {sessionState === 'active' && (
                  <>
                    <Button size="lg" onClick={handlePauseSession} variant="outline" className="px-8 py-4">
                      <Pause className="w-6 h-6 mr-2" />
                      Pause
                    </Button>
                    <Button size="lg" onClick={handleEndSession} className="tennis-button px-8 py-4">
                      <Square className="w-6 h-6 mr-2" />
                      End Session
                    </Button>
                  </>
                )}
                
                {sessionState === 'paused' && (
                  <>
                    <Button size="lg" onClick={handleResumeSession} className="tennis-button px-8 py-4">
                      <Play className="w-6 h-6 mr-2" />
                      Resume
                    </Button>
                    <Button size="lg" onClick={handleEndSession} variant="outline" className="px-8 py-4">
                      <Square className="w-6 h-6 mr-2" />
                      End Session
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, index) => (
              <Card key={index} className="court-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-tennis-purple-700 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Status */}
          {sessionState !== 'ready' && (
            <Card className="court-card mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-tennis-purple-600" />
                  AI Analysis Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Motion Tracking</span>
                    <span className="text-sm font-medium text-tennis-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shot Recognition</span>
                    <span className="text-sm font-medium text-tennis-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Performance Analysis</span>
                    <span className="text-sm font-medium text-tennis-green-600">Processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Session;
