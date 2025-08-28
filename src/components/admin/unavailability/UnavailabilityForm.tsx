import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourtLite, DOW, SetUnavailabilityRequest } from '@/lib/api/admin/types';
import { getCourtsLite } from '@/lib/api/admin/courts';
import { createUnavailabilityMock } from '@/lib/api/admin/unavailability';
import { toast } from 'sonner';

const DAYS: Array<{ value: DOW; label: string }> = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

interface UnavailabilityFormProps {
  onSuccess?: () => void;
}

export const UnavailabilityForm: React.FC<UnavailabilityFormProps> = ({ onSuccess }) => {
  const [courts, setCourts] = useState<CourtLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courtSearchOpen, setCourtSearchOpen] = useState(false);
  const [courtSearchValue, setCourtSearchValue] = useState('');
  
  const [formData, setFormData] = useState<SetUnavailabilityRequest>({
    courtId: 0,
    dayOfWeek: 'MONDAY',
    start: '',
    end: '',
    reason: ''
  });

  // Load courts on mount
  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      setLoading(true);
      /**
       * TODO[BE-LINK][AdminCourtController.list]
       * Endpoint (placeholder): GET /admin/courts?projection=lite
       * Token: Authorization: Bearer <JWT>
       * Replace mock call with real service when backend is ready.
       */
      const courtsData = await getCourtsLite();
      setCourts(courtsData);
    } catch (error) {
      console.error('Failed to load courts:', error);
      toast.error('Failed to load courts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courtId || !formData.dayOfWeek || !formData.start || !formData.end) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic validation
    if (formData.start >= formData.end) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData: SetUnavailabilityRequest = {
        courtId: formData.courtId,
        dayOfWeek: formData.dayOfWeek,
        start: formData.start + ':00', // Convert to HH:mm:ss format
        end: formData.end + ':00',
        reason: formData.reason?.trim() || undefined
      };

      /**
       * TODO[BE-LINK][AdminCourtUnavailabilityController.create]
       * Endpoint (placeholder): POST /admin/courts/{courtId}/unavailability
       * Token: Authorization: Bearer <JWT>
       * Replace mock call with real service when backend is ready.
       */
      await createUnavailabilityMock(requestData);
      
      toast.success('Court unavailability set successfully');
      
      // Reset form
      setFormData({
        courtId: 0,
        dayOfWeek: 'MONDAY',
        start: '',
        end: '',
        reason: ''
      });
      
      // Reset search
      setCourtSearchValue('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to set unavailability:', error);
      toast.error('Failed to set court unavailability');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Court Unavailability</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Court Selection */}
            <div>
              <Label htmlFor="court">Court *</Label>
              <Popover open={courtSearchOpen} onOpenChange={setCourtSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={courtSearchOpen}
                    className="w-full justify-between"
                    disabled={loading}
                  >
                    {formData.courtId
                      ? courts.find((court) => court.id === formData.courtId)?.name
                      : loading ? "Loading courts..." : "Select court..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search courts..."
                      value={courtSearchValue}
                      onValueChange={setCourtSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>No court found.</CommandEmpty>
                      <CommandGroup>
                        {courts
                          .filter((court) =>
                            court.name.toLowerCase().includes(courtSearchValue.toLowerCase())
                          )
                          .map((court) => (
                            <CommandItem
                              key={court.id}
                              value={court.name}
                              onSelect={() => {
                                setFormData({...formData, courtId: court.id})
                                setCourtSearchOpen(false)
                                setCourtSearchValue("")
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.courtId === court.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {court.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Day of Week */}
            <div>
              <Label htmlFor="dayOfWeek">Day of Week *</Label>
              <Select 
                value={formData.dayOfWeek} 
                onValueChange={(value: DOW) => setFormData({...formData, dayOfWeek: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.start}
                onChange={(e) => setFormData({...formData, start: e.target.value})}
                required
              />
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.end}
                onChange={(e) => setFormData({...formData, end: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason || ''}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="e.g., Scheduled maintenance, Private event, Court repairs..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={submitting || loading}
            className="w-full"
          >
            {submitting ? 'Setting Unavailability...' : 'Set Unavailability'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};