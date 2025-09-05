import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';

export function useAvailability(courtId: number, dateISO: string, durationMinutes: number = 60) {
  return useQuery({
    queryKey: ['availability', courtId, dateISO, durationMinutes],
    queryFn: () => bookingService.fetchAvailability(courtId, dateISO, durationMinutes),
    enabled: !!(courtId && dateISO),
    retry: 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}