
import React, { useState, useEffect } from 'react';
import { Pause, Square, Eye, Timer, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Session = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('web');

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
    toast.success(t('session.startingAiCamera'));
    
    setTimeout(() => {
      setIsRecording(true);
      setIsPaused(false);
      setIsLoading(false);
      toast.success(t('session.sessionStartedTracking'));
    }, 1500);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? t('session.sessionResumed') : t('session.sessionPaused'));
  };

  const handleStopRecording = () => {
    setIsLoading(true);
    toast.info(t('session.endingSessionProcessing'));
    
    setTimeout(() => {
      setIsRecording(false);
      setIsPaused(false);
      setIsLoading(false);
      toast.success(t('session.sessionCompletedRedirecting'));
      
      setTimeout(() => {
        navigate('/recordings');
      }, 1000);
    }, 2000);
  };

  const handleViewRecordings = () => {
    toast.info(t('session.loadingRecordings'));
    setTimeout(() => navigate('/recordings'), 500);
  };

  const handleViewLeaderboard = () => {
    toast.info(t('session.loadingLeaderboard'));
    setTimeout(() => navigate('/leaderboard'), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Session Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('session.title')}</h1>
            <p className="text-gray-600">{t('session.courtLocation')}</p>
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
                  {isRecording ? t('session.sessionActive') : t('session.readyToStart')}
                </h2>
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {t('session.courtInfo')}
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
                    {isRecording ? (isPaused ? t('session.pauseSession') : t('session.sessionActive')) : t('session.readyToStart')}
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
                    {isLoading ? t('session.starting') : t('session.startSession')}
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
                      {isPaused ? t('session.resumeSession') : t('session.pauseSession')}
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
                      {isLoading ? t('session.ending') : t('session.endSession')}
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
                <h3 className="font-semibold text-gray-900 mb-1">{t('session.cameraFeed')}</h3>
                <p className="text-sm text-gray-600">
                  {isRecording ? t('session.liveStreamingActive') : t('session.readyToStream')}
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-3 ${isRecording ? 'bg-tennis-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('checkIn.aiProcessing')}</h3>
                <p className="text-sm text-gray-600">
                  {isRecording ? t('session.realTimeAnalysis') : t('session.waitingToStart')}
                </p>
              </CardContent>
            </Card>

            <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6 text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-3 ${isRecording ? 'bg-tennis-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('session.dataStorage')}</h3>
                <p className="text-sm text-gray-600">
                  {isRecording ? t('session.cloudBackupActive') : t('session.readyToBackup')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="premium-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleViewRecordings}
                  variant="outline" 
                  className="w-full btn-outline"
                >
                  {t('session.viewPreviousSessions')}
                </Button>
                <Button 
                  onClick={handleViewLeaderboard}
                  variant="outline" 
                  className="w-full btn-outline"
                >
                  {t('session.checkLeaderboard')}
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
