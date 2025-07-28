// src/components/RequireRole.tsx
import React, { ReactNode } from "react";
import {Navigate, replace} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type Props = {
  roles: string[];             // allowed groups, e.g. ["ADMIN","SUPER_ADMIN"]
  children: ReactNode;
};

type JwtPayload = {
  "cognito:groups"?: string[];
  [key: string]: unknown;
};

export default function RequireRole({ roles, children }: Props) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    // not logged in at all
    return <Navigate to="/admin-login" replace />;
  }

  let groups: string[] = [];
  try {
    const payload = jwtDecode<JwtPayload>(token);
    groups = payload["cognito:groups"] || [];
  } catch {
    return <Navigate to="/admin-login" replace />;
  }

  // if user has none of the required roles, kick them out
  const allowed = groups.some(g => roles.includes(g));
  if (!allowed) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}
