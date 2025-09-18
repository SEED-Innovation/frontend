import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersPaged, updateUserEnabled } from '@/lib/api/services/userService';

export function useUsersPaged(page: number, size: number) {
  return useQuery({
    queryKey: ['users', 'paged', page, size],
    queryFn: () => getUsersPaged(page, size),
    staleTime: 30_000,
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