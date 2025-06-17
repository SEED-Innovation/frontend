
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoCard from '@/components/VideoCard';
import { Recording } from '@/types/recordings';

interface RecordingsListProps {
  recordings: Recording[];
  onPlayVideo: (recording: Recording) => void;
  onDownload: (recording: Recording) => void;
  onShare: (recording: Recording) => void;
}

const RecordingsList: React.FC<RecordingsListProps> = ({ 
  recordings, 
  onPlayVideo, 
  onDownload, 
  onShare 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Recordings</h1>
        <p className="text-gray-600">Review your sessions with AI-powered analytics</p>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((recording, index) => (
              <VideoCard
                key={recording.id}
                recording={recording}
                index={index}
                onPlay={onPlayVideo}
                onDownload={onDownload}
                onShare={onShare}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <div className="text-center py-12">
            <p className="text-gray-500">Showing matches only...</p>
          </div>
        </TabsContent>

        <TabsContent value="practice">
          <div className="text-center py-12">
            <p className="text-gray-500">Showing practice sessions only...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecordingsList;
