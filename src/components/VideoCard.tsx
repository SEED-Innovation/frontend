
import React from 'react';
import { Play, Calendar, Download, Share, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recording } from '@/types/recordings';

interface VideoCardProps {
  recording: Recording;
  index: number;
  onPlay: (recording: Recording) => void;
  onDownload: (recording: Recording) => void;
  onShare: (recording: Recording) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  recording, 
  index, 
  onPlay, 
  onDownload, 
  onShare 
}) => {
  return (
    <Card 
      className="premium-card group animate-fade-in hover:scale-105 transition-all duration-300" 
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div 
        className="relative cursor-pointer"
        onClick={() => onPlay(recording)}
      >
        <img
          src={recording.thumbnail}
          alt={recording.title}
          className="w-full h-48 object-cover rounded-t-2xl"
        />
        {/* Video overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-t-2xl flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>
        {/* Duration badge */}
        <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
          {recording.duration}
        </Badge>
        {/* Premium badge */}
        {recording.premium && (
          <Badge className="absolute top-3 left-3 bg-tennis-purple-600 text-white">
            Premium
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
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
            AI Tracked
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-tennis-purple-700">{recording.stats.serveAccuracy}%</div>
            <div className="text-gray-600 text-xs">Serve Accuracy</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-tennis-purple-700">{recording.stats.avgSpeed} mph</div>
            <div className="text-gray-600 text-xs">Avg Speed</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 tennis-button text-sm glow-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Watch button clicked!', recording.title);
              onPlay(recording);
            }}
          >
            <Play className="w-4 h-4 mr-1" />
            Watch
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="btn-outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Download button clicked!', recording.title);
              onDownload(recording);
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="btn-outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Share button clicked!', recording.title);
              onShare(recording);
            }}
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
