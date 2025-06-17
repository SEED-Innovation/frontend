
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import VideoPlayerView from '@/components/VideoPlayerView';
import RecordingsList from '@/components/RecordingsList';
import { toast } from 'sonner';
import { recordings } from '@/data/recordingsData';
import { Recording } from '@/types/recordings';

const Recordings = () => {
  const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);

  const handleDownload = (recording: Recording) => {
    console.log('Download clicked for:', recording.title);
    if (recording.premium) {
      toast.success(`Downloading ${recording.title}...`);
    } else {
      toast.error('Premium subscription required for downloads');
    }
  };

  const handleShare = (recording: Recording) => {
    console.log('Share clicked for:', recording.title);
    toast.success('Share link copied to clipboard!');
  };

  const handlePlayVideo = (recording: Recording) => {
    console.log('Playing video:', recording.title);
    setSelectedVideo(recording);
    toast.success(`Now playing: ${recording.title}`);
  };

  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-12">
          <VideoPlayerView
            recording={selectedVideo}
            onBack={() => setSelectedVideo(null)}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <RecordingsList
          recordings={recordings}
          onPlayVideo={handlePlayVideo}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      </div>
    </div>
  );
};

export default Recordings;
