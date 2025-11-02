import React, { useState } from 'react';
import { Download, Calendar, Clock, Star, TrendingUp, Eye, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Recordings = () => {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const { t } = useTranslation('web');

  const recordings = [
    {
      id: 1,
      title: "Practice Session vs Alex",
      date: "Dec 15, 2024",
      duration: "1:45:32",
      court: "Riverside Tennis Club",
      score: "6-4, 6-2",
      thumbnail: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=225&fit=crop",
      videoUrl: "/videos/match1.mp4",
      stats: {
        serves: 89,
        serveAccuracy: 78,
        avgSpeed: 45,
        winners: 23
      },
      premium: false
    },
    {
      id: 2,
      title: "Match vs Sarah Chen",
      date: "Dec 12, 2024",
      duration: "2:15:18",
      court: "Elite Tennis Academy",
      score: "4-6, 6-3, 6-4",
      thumbnail: "https://images.unsplash.com/photo-1614743653196-d969b45200b9?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      videoUrl: "/videos/match2.mp4",
      stats: {
        serves: 124,
        serveAccuracy: 82,
        avgSpeed: 48,
        winners: 31
      },
      premium: true
    },
    {
      id: 3,
      title: "Training Session",
      date: "Dec 10, 2024",
      duration: "1:30:45",
      court: "Downtown Sports Center",
      score: "Practice",
      thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=225&fit=crop",
      videoUrl: "/videos/match3.mp4",
      stats: {
        serves: 67,
        serveAccuracy: 85,
        avgSpeed: 43,
        winners: 18
      },
      premium: false
    }
  ];

  const handleDownload = (recording: any) => {
    if (recording.premium) {
      // Simulate download
      toast.success(t('recordings.downloading', { title: recording.title }));
    } else {
      toast.error(t('recordings.premiumRequired'));
    }
  };

  const handleShare = (recording: any) => {
    toast.success(t('recordings.shareLinkCopied'));
  };

  const handleViewVideo = (recording: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Viewing video:', recording.title);
    setSelectedVideo(recording);
    toast.success(t('recordings.nowViewing', { title: recording.title }));
  };

  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedVideo(null)}
                className="btn-outline clickable-element"
              >
                {t('recordings.backToRecordings')}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Video Player */}
              <div className="lg:col-span-2 space-y-6">
                <VideoPlayer
                  videoUrl={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  duration={selectedVideo.duration}
                  isPremium={selectedVideo.premium}
                  onDownload={() => handleDownload(selectedVideo)}
                  onShare={() => handleShare(selectedVideo)}
                />

                {/* Match Info */}
                <Card className="premium-card">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedVideo.title}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{t('recordings.date')}</span>
                        <p className="font-medium">{selectedVideo.date}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('recordings.court')}</span>
                        <p className="font-medium">{selectedVideo.court}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('recordings.duration')}</span>
                        <p className="font-medium">{selectedVideo.duration}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('recordings.score')}</span>
                        <p className="font-medium text-tennis-green-700">{selectedVideo.score}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-tennis-purple-600" />
                      {t('recordings.performanceStats')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="stats-card">
                      <div className="text-3xl font-bold text-tennis-purple-700">
                        {selectedVideo.stats.serves}
                      </div>
                      <div className="text-sm text-gray-600">{t('recordings.totalServes')}</div>
                    </div>
                    
                    <div className="stats-card">
                      <div className="text-3xl font-bold text-tennis-green-700">
                        {selectedVideo.stats.serveAccuracy}%
                      </div>
                      <div className="text-sm text-gray-600">{t('recordings.serveAccuracy')}</div>
                    </div>
                    
                    <div className="stats-card">
                      <div className="text-3xl font-bold text-blue-700">
                        {selectedVideo.stats.avgSpeed} mph
                      </div>
                      <div className="text-sm text-gray-600">{t('recordings.avgSpeed')}</div>
                    </div>
                    
                    <div className="stats-card">
                      <div className="text-3xl font-bold text-yellow-700">
                        {selectedVideo.stats.winners}
                      </div>
                      <div className="text-sm text-gray-600">{t('recordings.winners')}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-tennis-purple-600" />
                      {t('recordings.aiInsights')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-tennis-green-50 rounded-xl">
                      <p className="text-sm text-tennis-green-700 font-medium">
                        {t('recordings.greatServeConsistency')}
                      </p>
                    </div>
                    <div className="p-3 bg-tennis-purple-50 rounded-xl">
                      <p className="text-sm text-tennis-purple-700 font-medium">
                        {t('recordings.considerBackhandPlacement')}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-700 font-medium">
                        {t('recordings.excellentNetPlay')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('recordings.title')}</h1>
            <p className="text-gray-600">{t('recordings.subtitle')}</p>
          </div>

          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all">{t('recordings.allVideos')}</TabsTrigger>
              <TabsTrigger value="matches">{t('recordings.matches')}</TabsTrigger>
              <TabsTrigger value="practice">{t('recordings.practice')}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Video Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recordings.map((recording, index) => (
                  <Card 
                    key={recording.id} 
                    className="premium-card card-with-buttons group cursor-pointer animate-fade-in hover:scale-105 transition-all duration-300" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleViewVideo(recording)}
                  >
                    <div className="relative">
                      <img
                        src={recording.thumbnail}
                        alt={recording.title}
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />

                      {/* Duration badge */}
                      <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
                        {recording.duration}
                      </Badge>
                      {/* Premium badge */}
                      {recording.premium && (
                        <Badge className="absolute top-3 left-3 bg-tennis-purple-600 text-white">
                          {t('recordings.premium')}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6 card-content">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{recording.title}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <Calendar className="w-4 h-4 mr-1" />
                        {recording.date}
                        <span className="mx-2">•</span>
                        {recording.court}
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-tennis-green-700 border-tennis-green-200">
                          {recording.score}
                        </Badge>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Eye className="w-4 h-4 mr-1" />
                          {t('recordings.aiTracked')}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold text-tennis-purple-700">{recording.stats.serveAccuracy}%</div>
                          <div className="text-gray-600 text-xs">{t('recordings.serveAccuracy')}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold text-tennis-purple-700">{recording.stats.avgSpeed} mph</div>
                          <div className="text-gray-600 text-xs">{t('recordings.avgSpeed')}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 tennis-button text-sm glow-button clickable-element"
                          onClick={(e) => handleViewVideo(recording, e)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('recordings.view')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="btn-outline clickable-element"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(recording);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="btn-outline clickable-element"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(recording);
                          }}
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matches">
              <div className="text-center py-12">
                <p className="text-gray-500">{t('recordings.showingMatchesOnly')}</p>
              </div>
            </TabsContent>

            <TabsContent value="practice">
              <div className="text-center py-12">
                <p className="text-gray-500">{t('recordings.showingPracticeOnly')}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Recordings;
