
import React, { useState, useEffect } from 'react';
import { Pause, Square, Eye, Timer, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Session = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    setIsLoading(true);
    toast.success('Starting AI camera session...');
    
    setTimeout(() => {
      setIsRecording(true);
      setIsPaused(false);
      setIsLoading(false);
      toast.success('Session started! AI is now tracking your game.');
    }, 1500);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Session resumed' : 'Session paused');
  };

  const handleStopRecording = () => {
    setIsLoading(true);
    toast.info('Ending session and processing data...');
    
    setTimeout(() => {
      setIsRecording(false);
      setIsPaused(false);
      setIsLoading(false);
      toast.success('Session completed! Redirecting to recordings...');
      
      setTimeout(() => {
        navigate('/recordings');
      }, 1000);
    }, 2000);
  };

  const handleViewRecordings = () => {
    toast.info('Loading your recordings...');
    setTimeout(() => navigate('/recordings'), 500);
  };

  const handleViewLeaderboard = () => {
    toast.info('Loading leaderboard...');
    setTimeout(() => navigate('/leaderboard'), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Session Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Session</h1>
            <p className="text-gray-600">Riverside Tennis Club - Court 3</p>
          </div>

          {/* Main Session Card */}
          <Card className="premium-card mb-8 animate-fade-in">
            <CardContent className="p-8">
              {/* Court Info */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 tennis-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isRecording ? 'AI Camera Active' : 'Ready to Start'}
                </h2>
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  Court 3, Riverside Tennis Club
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-6xl font-mono font-bold text-tennis-purple-700 mb-2">
                  {formatTime(sessionTime)}
                </div>
                <div className="flex items-center justify-center">
                  <Timer className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-gray-600">
                    {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready to start'}
                  </span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording}
                    className="tennis-button px-8 py-4 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    {isLoading ? 'Starting...' : 'Start Session'}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handlePauseResume}
                      variant="outline"
                      className="btn-outline px-6 py-4"
                      disabled={isLoading}
                    >
                      {isPaused ? null : <Pause className="w-5 h-5 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button 
                      onClick={handleStopRecording}
                      variant="destructive"
                      className="px-6 py-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Square className="w-5 h-5 mr-2" />
                      )}
                      {isLoading ? 'Ending...' : 'End Session'}
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
                <div className={`w-3 h-3 rounded-full mx-auto mb-3 ${isRecording ? 'bg-tennis-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h3 className="font-semibold text-gray-900 mb-1">Camera Feed</h3>
                <p className="text-sm text-gray-600">
                  {isRecording ? 'Live streaming active' : 'Ready to stream'}
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-3 ${isRecording ? 'bg-tennis-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h3 className="font-semibold text-gray-900 mb-1">AI Processing</h3>
                <p className="text-sm text-gray-600">
                  {isRecording ? 'Real-time analysis' : 'Waiting to start'}
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6 text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-3 ${isRecording ? 'bg-tennis-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h3 className="font-semibold text-gray-900 mb-1">Data Storage</h3>
                <p className="text-sm text-gray-600">
                  {isRecording ? 'Cloud backup active' : 'Ready to backup'}
                </p>
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
                <Button 
                  onClick={handleViewRecordings}
                  variant="outline" 
                  className="w-full btn-outline"
                >
                  View Previous Sessions
                </Button>
                <Button 
                  onClick={handleViewLeaderboard}
                  variant="outline" 
                  className="w-full btn-outline"
                >
                  Check Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Session;
