import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const AUTH_TOKEN_KEY = "auth_token";
const DEMO_USER_KEY = "demo_user";

export const DEMO_ADMIN_USER: User = {
  id: 900001,
  name: "Administrador Demo",
  email: "admin@directoriocartago.co",
  role: "admin",
  phone: null,
  createdAt: "2026-04-06T12:00:00.000Z",
  hasActiveSubscription: false,
};

export const DEMO_PREMIUM_USER: User = {
  id: 900002,
  name: "Usuario Premium Demo",
  email: "premium@directoriocartago.co",
  role: "business_owner",
  phone: "3005550001",
  createdAt: "2026-04-06T12:00:00.000Z",
  hasActiveSubscription: true,
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [demoUser, setDemoUser] = useState<User | null>(() => parseDemoUser());
  const queryClient = useQueryClient();
  const isDemoSession = Boolean(token?.startsWith("demo-token:"));

  const { data: apiUser, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token && !isDemoSession,
      retry: false,
    },
  });

  useEffect(() => {
    if (isError && !isDemoSession) {
      logout();
    }
  }, [isDemoSession, isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);

    if (newToken.startsWith("demo-token:")) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
      setDemoUser(newUser);
      queryClient.setQueryData([`/api/auth/me`], newUser);
      return;
    }

    localStorage.removeItem(DEMO_USER_KEY);
    setDemoUser(null);
    queryClient.setQueryData([`/api/auth/me`], newUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(DEMO_USER_KEY);
    setToken(null);
    setDemoUser(null);
    queryClient.setQueryData([`/api/auth/me`], null);
    queryClient.clear();
  };

  const user = useMemo(() => {
    if (isDemoSession) {
      return demoUser;
    }
    return apiUser || null;
  }, [apiUser, demoUser, isDemoSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !!token && !isDemoSession && isLoading,
        isAuthenticated: !!user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
