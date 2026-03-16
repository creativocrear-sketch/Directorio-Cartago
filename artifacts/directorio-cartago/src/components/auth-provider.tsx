import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const queryClient = useQueryClient();

  // Custom fetch in orval should ideally intercept and use this token,
  // but if it doesn't automatically, we rely on standard credentials or we'd need to patch customFetch.
  // Assuming customFetch uses localStorage.getItem('auth_token').

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      // Token invalid or expired
      logout();
    }
  }, [isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    queryClient.setQueryData([`/api/auth/me`], newUser);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    queryClient.setQueryData([`/api/auth/me`], null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: !!token && isLoading,
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
