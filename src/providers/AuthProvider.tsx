"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import type { User } from "@/types/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await usersApi.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    // Check for existing token in sessionStorage
    const storedToken = sessionStorage.getItem("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
      fetchCurrentUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setAccessToken(response.tokens.accessToken);
    sessionStorage.setItem("accessToken", response.tokens.accessToken);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const response = await authApi.register({ email, password, displayName });
      setAccessToken(response.tokens.accessToken);
      sessionStorage.setItem("accessToken", response.tokens.accessToken);
      setUser(response.user);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem("accessToken");
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
