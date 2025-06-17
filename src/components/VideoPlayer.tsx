
import React, { useState } from 'react';
import { Play, Pause, Volume2, Download, Share, FullScreen, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  duration: string;
  isPremium?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  title, 
  duration, 
  isPremium = false,
  onDownload,
  onShare 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(100);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="premium-card overflow-hidden">
      <div 
        className="relative bg-black aspect-video cursor-pointer"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Thumbnail/Player */}
        <div className="absolute inset-0 bg-gradient-to-br from-tennis-purple-900/50 to-tennis-green-900/50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">{isPlaying ? '⏸️' : '▶️'}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-300">{duration}</p>
          </div>
        </div>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Video Controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Progress 
                value={(currentTime / totalTime) * 100} 
                className="h-1 bg-white/20 cursor-pointer"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-tennis-green-400 p-2"
                  onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-tennis-green-400 p-2"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-tennis-green-400 p-2"
                  onClick={() => setCurrentTime(Math.min(totalTime, currentTime + 10))}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <div className="w-20">
                    <Progress value={volume} className="h-1" />
                  </div>
                </div>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(totalTime)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {isPremium && onDownload && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-tennis-green-400 p-2"
                    onClick={onDownload}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                )}

                {onShare && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-tennis-green-400 p-2"
                    onClick={onShare}
                  >
                    <Share className="w-5 h-5" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-tennis-green-400 p-2"
                >
                  <FullScreen className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoPlayer;
