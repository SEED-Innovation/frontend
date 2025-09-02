import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimeRangeInputsProps {
  startTime?: string;
  endTime?: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  className?: string;
}

export const TimeRangeInputs: React.FC<TimeRangeInputsProps> = ({
  startTime = '',
  endTime = '',
  onStartTimeChange,
  onEndTimeChange,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Label htmlFor="start-time" className="text-sm text-muted-foreground whitespace-nowrap">
          Start ≥
        </Label>
        <Input
          id="start-time"
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          className="w-36"
        />
      </div>
      <div className="flex items-center gap-1">
        <Label htmlFor="end-time" className="text-sm text-muted-foreground whitespace-nowrap">
          End ≤
        </Label>
        <Input
          id="end-time"
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          className="w-24"
        />
      </div>
    </div>
  );
};