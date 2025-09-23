import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

interface UseUsersPagedOptions {
  page?: number;
  size?: number;
  type?: 'user' | 'admin';
  enabled?: boolean;
}

export const useUsersPaged = ({
  page = 1,
  size = 10,
  type,
  enabled = true
}: UseUsersPagedOptions = {}) => {
  return useQuery({
    queryKey: ['users', 'paged', page, size, type],
    queryFn: () => userService.getUsersPaged(page, size, type),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};