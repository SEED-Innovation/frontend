
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VideoPlayer from '@/components/VideoPlayer';
import PerformanceStats from '@/components/PerformanceStats';
import AIInsights from '@/components/AIInsights';
import { Recording } from '@/types/recordings';

interface VideoPlayerViewProps {
  recording: Recording;
  onBack: () => void;
  onDownload: (recording: Recording) => void;
  onShare: (recording: Recording) => void;
}

const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ 
  recording, 
  onBack, 
  onDownload, 
  onShare 
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="btn-outline"
        >
          ← Back to Recordings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer
            videoUrl={recording.videoUrl}
            title={recording.title}
            duration={recording.duration}
            isPremium={recording.premium}
            onDownload={() => onDownload(recording)}
            onShare={() => onShare(recording)}
          />

          {/* Match Info */}
          <Card className="premium-card">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{recording.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium">{recording.date}</p>
                </div>
                <div>
                  <span className="text-gray-600">Court:</span>
                  <p className="font-medium">{recording.court}</p>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="font-medium">{recording.duration}</p>
                </div>
                <div>
                  <span className="text-gray-600">Score:</span>
                  <p className="font-medium text-tennis-green-700">{recording.score}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <PerformanceStats recording={recording} />
          <AIInsights />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerView;
