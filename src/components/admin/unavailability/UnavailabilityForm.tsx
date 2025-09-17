import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Calendar, Ban, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourtLite, SetUnavailabilityRequest } from '@/lib/api/admin/types';
import { getCourtsLite } from '@/lib/api/admin/courts';
import { createUnavailabilityMock } from '@/lib/api/admin/unavailability';
import { courtService, MarkUnavailableRequest } from '@/lib/api/services/courtService';
import { Court } from '@/types/court';
import { handleApiError, isErrorCode } from '@/utils/errorMapper';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';


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

  const selectedCourt = courts.find((court) => court.id === formData.courtId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-card border-l-4 border-l-destructive/30 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Block Court Availability</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Prevent bookings for specific dates
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50/50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Blocking a date will prevent all new bookings. Existing bookings may need approval to proceed.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Court Selection */}
              <div className="space-y-2">
                <Label htmlFor="court" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Court *
                </Label>
                <Popover open={courtSearchOpen} onOpenChange={setCourtSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={courtSearchOpen}
                      className={cn(
                        "w-full justify-between h-11 premium-input",
                        !formData.courtId && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <div className="flex items-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span>
                          {formData.courtId
                            ? selectedCourt?.name
                            : loading ? "Loading courts..." : "Select court..."
                          }
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 shadow-lg border-0">
                    <Command>
                      <CommandInput
                        placeholder="Search courts..."
                        value={courtSearchValue}
                        onValueChange={setCourtSearchValue}
                        className="border-0"
                      />
                      <CommandList className="max-h-48">
                        <CommandEmpty className="text-center py-6 text-muted-foreground">
                          No courts found.
                        </CommandEmpty>
                        <CommandGroup>
                          <AnimatePresence>
                            {courts
                              .filter((court) =>
                                court.name.toLowerCase().includes(courtSearchValue.toLowerCase())
                              )
                              .map((court, index) => (
                                <motion.div
                                  key={court.id}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <CommandItem
                                    value={court.name}
                                    onSelect={() => {
                                      setFormData({...formData, courtId: court.id})
                                      setCourtSearchOpen(false)
                                      setCourtSearchValue("")
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.courtId === court.id ? "opacity-100 text-primary" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                      <span>{court.name}</span>
                                      {court.location && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          {court.location}
                                        </Badge>
                                      )}
                                    </div>
                                  </CommandItem>
                                </motion.div>
                              ))}
                          </AnimatePresence>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date *
                </Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="premium-input h-11"
                  />
                </div>
              </div>
            </div>

            {/* Selected Court Preview */}
            <AnimatePresence>
              {selectedCourt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-muted/30 rounded-lg p-4 border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Selected Court</h4>
                      <p className="text-sm text-muted-foreground">{selectedCourt.name}</p>
                    </div>
                    {selectedCourt.location && (
                      <Badge variant="outline">{selectedCourt.location}</Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                disabled={submitting || loading || !formData.courtId || !formData.date}
                className="w-full h-11 bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive text-white font-medium shadow-lg"
              >
                <AnimatePresence mode="wait">
                  {submitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Blocking Date...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Block This Date
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};