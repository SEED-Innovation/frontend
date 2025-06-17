
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Eye, Timer, MapPin, Camera, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Session = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    toast({
      title: "Session Started",
      description: "AI recording and analysis has begun!",
    });
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Session Resumed" : "Session Paused",
      description: isPaused ? "Recording has resumed" : "Recording is paused",
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    toast({
      title: "Session Ended",
      description: "Your session has been saved and is being processed for analysis.",
    });
    // Simulate processing and navigation to results
    setTimeout(() => {
      navigate('/recordings');
    }, 2000);
  };

  const sessionStats = [
    { label: "Shots Detected", value: isRecording ? Math.floor(sessionTime / 3) : 0, icon: Camera },
    { label: "Rally Count", value: isRecording ? Math.floor(sessionTime / 15) : 0, icon: Users },
    { label: "Active Time", value: `${Math.floor(sessionTime / 60)}m`, icon: Timer }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Session Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Session</h1>
            <div className="flex items-center justify-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Riverside Tennis Club - Court 3</span>
            </div>
          </div>

          {/* Main Session Card */}
          <Card className="premium-card mb-8 animate-fade-in">
            <CardContent className="p-8">
              {/* Court Info */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 tennis-gradient rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <Eye className="w-12 h-12 text-white" />
                  {isRecording && !isPaused && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Camera Active</h2>
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isRecording 
                      ? isPaused 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isRecording 
                        ? isPaused 
                          ? 'bg-yellow-500'
                          : 'bg-green-500 animate-pulse'
                        : 'bg-gray-500'
                    }`}></div>
                    {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-6xl font-mono font-bold text-tennis-purple-700 mb-2">
                  {formatTime(sessionTime)}
                </div>
                <div className="flex items-center justify-center">
                  <Timer className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-gray-600">Session Duration</span>
                </div>
              </div>

              {/* Live Stats */}
              {isRecording && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {sessionStats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-tennis-purple-50 rounded-xl">
                      <stat.icon className="w-6 h-6 text-tennis-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-tennis-purple-700">{stat.value}</div>
                      <div className="text-sm text-tennis-purple-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording}
                    className="tennis-button px-8 py-4 text-lg"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Start Session
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handlePauseResume}
                      variant="outline"
                      className="btn-outline px-6 py-4"
                    >
                      {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button 
                      onClick={handleStopRecording}
                      variant="destructive"
                      className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      End Session
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-3 h-3 bg-tennis-green-500 rounded-full mx-auto mb-3 animate-pulse"></div>
                <h3 className="font-semibold text-gray-900 mb-1">Camera Feed</h3>
                <p className="text-sm text-gray-600">Live streaming active</p>
              </CardContent>
            </Card>

            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-3 h-3 bg-tennis-green-500 rounded-full mx-auto mb-3 animate-pulse"></div>
                <h3 className="font-semibold text-gray-900 mb-1">AI Processing</h3>
                <p className="text-sm text-gray-600">Real-time analysis</p>
              </CardContent>
            </Card>

            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-3 h-3 bg-tennis-green-500 rounded-full mx-auto mb-3 animate-pulse"></div>
                <h3 className="font-semibold text-gray-900 mb-1">Data Storage</h3>
                <p className="text-sm text-gray-600">Cloud backup active</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/recordings">
                  <Button variant="outline" className="w-full btn-outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Previous Sessions
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline" className="w-full btn-outline">
                    <Users className="w-4 h-4 mr-2" />
                    Check Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Session;
