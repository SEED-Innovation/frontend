import { useQuery } from '@tanstack/react-query';
import { courtService } from '@/lib/api/services/courtService';

export function useCourtsPaged(page: number, size: number) {
  return useQuery({
    queryKey: ['courts', 'paged', page, size],
    queryFn: () => courtService.getCourtsPaged(page, size),
    staleTime: 30_000,
  });
}