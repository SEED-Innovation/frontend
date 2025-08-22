import { useState, useEffect, useCallback } from 'react';
import { AdminUser, AdminRole } from '@/types/admin';
import { jwtDecode } from 'jwt-decode';

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
  const buildUser = (payload: TokenPayLoad): AdminUser | null => {
    const userRole = payload["cognito:groups"]?.[0];

    // Only allow ADMIN and SUPER_ADMIN roles to access admin panel
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new Error("Access denied. Admin privileges required.");
    }

    return {
      id: payload.sub,
      name: payload.name || "",
      email: payload.email,
      role: userRole as AdminRole,
      assignedCourts: [],      // you can fetch this from a /user/profile or embed in token
      avatar: ""                // same as above
    };
  };

  // On mount: check for stored token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = jwtDecode<TokenPayLoad>(token);
      const adminUser = buildUser(payload);
      setUser(adminUser);
    } catch {
      // Invalid token or insufficient permissions
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(
    async (identifier: string, password: string, rememberMe = false) => {
      setLoading(true);
      try {
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

        const payload = jwtDecode<TokenPayLoad>(accessToken);
        const adminUser = buildUser(payload); // This will throw if not admin role

        localStorage.setItem("accessToken", accessToken);
        setUser(adminUser);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        throw error; // Re-throw to be handled by the login form
      }
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