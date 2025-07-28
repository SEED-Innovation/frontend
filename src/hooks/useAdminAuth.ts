import {useState, useEffect, useCallback} from 'react';
import { AdminUser, AdminRole } from '@/types/admin';
import {jwtDecode} from 'jwt-decode';

// Mock admin user for development
// const mockAdminUser: AdminUser = {
//   id: '1',
//   name: 'OMAR OMAR',
//   email: 'admin@seed.com',
//   role: 'SUPER_ADMIN',
//   assignedCourts: ['court-1', 'court-2', 'court-3'],
//   avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
// };

type TokenPayLoad = {
  sub: string;
  email: string;
  "cognito:groups"?: string[];
  name?: string;
  [key: string]: unknown;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: build AdminUser from token+profile
    const buildUser = (payload: TokenPayLoad): AdminUser => ({
    id: payload.sub,
    name: payload.name || "",
    email: payload.email,
    role: (payload["cognito:groups"]?.[0] || "PLAYER") as AdminRole,
    assignedCourts: [],      // you can fetch this from a /user/profile or embed in token
    avatar: ""                // same as above
  });

  // On mount: check for stored token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = jwtDecode<TokenPayLoad>(token);
      // Optional: check expiry
      setUser(buildUser(payload));
    } catch {
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  }, []);
  // useEffect(() => {
  //   // Simulate loading and authentication
  //   const timer = setTimeout(() => {
  //     setUser(mockAdminUser);
  //     setLoading(false);
  //   }, 500);
  //
  //   return () => clearTimeout(timer);
  // }, []);

    // Login function
  const login = useCallback(
    async (identifier: string, password: string, rememberMe = false) => {
      setLoading(true);
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.message || "Login failed");
      }
      const { accessToken } = await resp.json();
      localStorage.setItem("accessToken", accessToken);

      const payload = jwtDecode<TokenPayLoad>(accessToken);
      setUser(buildUser(payload));
      setLoading(false);
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/admin-login";
  }, []);

  const hasPermission = (requiredRole: AdminRole): boolean => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    return user.role === requiredRole;
  };

  const canAccessCourt = (courtId: string): boolean => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    return user.assignedCourts.includes(courtId);
  };



  // const hasPermission = (requiredRole: AdminRole): boolean => {
  //   if (!user) return false;
  //   if (user.role === 'SUPER_ADMIN') return true;
  //   return user.role === requiredRole;
  // };
  //
  // const canAccessCourt = (courtId: string): boolean => {
  //   if (!user) return false;
  //   if (user.role === 'SUPER_ADMIN') return true;
  //   return user.assignedCourts?.includes(courtId) || false;
  // };
  //
  // const logout = () => {
  //   setUser(null);
  //   // Redirect to landing page
  //   window.location.href = '/';
  // };

  return {
    user,
    loading,
    login,
    logout,
    hasPermission,
    canAccessCourt,
    isAuthenticated: !!user
  };
};