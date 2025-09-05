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
import { CourtLite, SetUnavailabilityRequest } from '@/lib/api/admin/types';
import { getCourtsLite } from '@/lib/api/admin/courts';
import { createUnavailabilityMock } from '@/lib/api/admin/unavailability';
import { courtService, Court, MarkUnavailableRequest } from '@/lib/api/services/courtService';
import { handleApiError, isErrorCode } from '@/utils/errorMapper';
import { toast } from 'sonner';


interface UnavailabilityFormProps {
  onSuccess?: () => void;
}

export const UnavailabilityForm: React.FC<UnavailabilityFormProps> = ({ onSuccess }) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courtSearchOpen, setCourtSearchOpen] = useState(false);
  const [courtSearchValue, setCourtSearchValue] = useState('');
  
  const [formData, setFormData] = useState({
    courtId: '',
    date: ''
  });

  // Load courts on mount
  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      setLoading(true);
      // Try to fetch from real API first, fallback to mock if needed
      try {
        const courtsData = await courtService.getAllCourts();
        setCourts(courtsData);
      } catch (apiError) {
        console.warn('Real API failed, falling back to mock data:', apiError);
        // Fallback to mock data
        const courtsData = await getCourtsLite();
        // Transform CourtLite to Court format for compatibility
        const transformedCourts: Court[] = courtsData.map(court => ({
          id: court.id.toString(),
          name: court.name,
          location: '', // Not available in CourtLite
          type: '', // Not available in CourtLite
          hourlyFee: 0, // Not available in CourtLite
          hasSeedSystem: false, // Not available in CourtLite
          amenities: [] // Not available in CourtLite
        }));
        setCourts(transformedCourts);
        toast.info('Using mock data - API not available');
      }
    } catch (error) {
      console.error('Failed to load courts:', error);
      toast.error('Failed to load courts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courtId || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (selectedDate < today) {
      toast.error('Cannot mark past dates as unavailable');
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData: MarkUnavailableRequest = {
        courtId: parseInt(formData.courtId),
        date: formData.date // Should be in YYYY-MM-DD format
      };

      // Call real API
      try {
        await courtService.markUnavailable(requestData);
        toast.success('Day blocked successfully');
      } catch (apiError) {
        handleApiError(apiError); // Let error mapper handle all specific error cases
        return; // Exit early to prevent form reset
      }
      
      // Reset form
      setFormData({
        courtId: '',
        date: ''
      });
      
      // Reset search
      setCourtSearchValue('');
      
      onSuccess?.();
    } catch (error) {
      // This catch block should rarely be reached now since we handle API errors above
      console.error('Unexpected error in form submission:', error);
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

            {/* Date */}
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                required
              />
            </div>
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