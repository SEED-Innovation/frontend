import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersPaged, updateUserEnabled } from '@/lib/api/services/userService';
import { userService } from '@/services/userService';

export function useUsersPaged(page: number, size: number, isAdmins: boolean = false) {
  return useQuery({
    queryKey: ['users', 'paged', page, size, isAdmins],
    queryFn: () => isAdmins ? userService.getAdminsPaged(page, size) : getUsersPaged(page, size),
    staleTime: 30_000,
  });
}

export function useUserDetails(userId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['user', 'details', userId],
    queryFn: () => userId ? userService.getUserDetails(userId) : null,
    enabled: enabled && userId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
  });
}

export function useToggleUserEnabled(page: number, size: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => updateUserEnabled(id, enabled),
    onMutate: async ({ id, enabled }) => {
      const key = ['users', 'paged', page, size];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<any>(key);
      // optimistic update
      if (prev) {
        qc.setQueryData(key, {
          ...prev,
          users: prev.users.map((u: any) =>
            u.id === id ? { ...u, status: enabled ? 'Active' : 'Disabled' } : u
          ),
        });
      }
      return { prev, key };
    },
    onError: (_err, _v, ctx) => { if (ctx?.prev && ctx?.key) qc.setQueryData(ctx.key, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['users', 'paged', page, size] }),
  });
}