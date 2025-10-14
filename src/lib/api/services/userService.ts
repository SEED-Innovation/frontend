import { AdminUserPageResponse } from '@/types/user';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
});

const BASE = '/admin/users';

export async function getUsersPaged(page = 0, size = 50): Promise<AdminUserPageResponse> {
  const url = new URL(`${import.meta.env.VITE_API_URL}${BASE}/paged`);
  url.searchParams.set('page', String(Math.max(0, page)));
  url.searchParams.set('size', String(Math.min(100, Math.max(1, size))));
  
  const res = await fetch(url.toString(), {
    headers: authHeaders(),
  });
  
  if (!res.ok) throw new Error(`Failed to fetch users (paged): ${res.statusText}`);
  return res.json();
}

export async function getAdminsPaged(page = 0, size = 50): Promise<AdminUserPageResponse> {
  const url = new URL(`${import.meta.env.VITE_API_URL}${BASE}/admins-paged`);
  url.searchParams.set('page', String(Math.max(0, page)));
  url.searchParams.set('size', String(Math.min(100, Math.max(1, size))));
  
  const res = await fetch(url.toString(), {
    headers: authHeaders(),
  });
  
  if (!res.ok) throw new Error(`Failed to fetch admins (paged): ${res.statusText}`);
  return res.json();
}

export async function updateUserEnabled(id: number, enabled: boolean) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${BASE}/update`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ id, enabled }),
  });
  
  if (!res.ok) throw new Error(`Failed to update user: ${res.statusText}`);
  return res.json();
}