"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  setAccessToken,
  setOnRefreshTokens,
  setOnClearAuth,
} from "@/lib/api/client";
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_THRESHOLD = 0.8;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const scheduleRefreshRef = useRef<(expiresInSeconds: number) => void>(
    () => {}
  );

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearAuth = useCallback(() => {
    clearRefreshTimer();
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("tokenExpiresAt");
    sessionStorage.removeItem("tokenLifetimeMs");
  }, [clearRefreshTimer]);

  const performRefresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const doRefresh = async () => {
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearAuth();
        return;
      }

      try {
        const response = await authApi.refreshTokens(refreshToken);
        setAccessToken(response.tokens.accessToken);
        sessionStorage.setItem("accessToken", response.tokens.accessToken);
        sessionStorage.setItem("refreshToken", response.tokens.refreshToken);
        const expiresAt = Date.now() + response.tokens.expiresIn * 1000;
        sessionStorage.setItem("tokenExpiresAt", expiresAt.toString());
        sessionStorage.setItem(
          "tokenLifetimeMs",
          (response.tokens.expiresIn * 1000).toString()
        );
        scheduleRefreshRef.current(response.tokens.expiresIn);
      } catch {
        clearAuth();
      }
    };

    refreshPromiseRef.current = doRefresh().finally(() => {
      refreshPromiseRef.current = null;
    });
    return refreshPromiseRef.current;
  }, [clearAuth]);

  const scheduleRefreshAfterDelay = useCallback(
    (delaySeconds: number) => {
      clearRefreshTimer();
      const delayMs = delaySeconds * 1000;
      refreshTimerRef.current = setTimeout(() => {
        performRefresh();
      }, delayMs);
    },
    [clearRefreshTimer, performRefresh]
  );

  const scheduleRefresh = useCallback(
    (totalLifetimeSeconds: number) => {
      const delaySeconds = totalLifetimeSeconds * REFRESH_THRESHOLD;
      scheduleRefreshAfterDelay(delaySeconds);
    },
    [scheduleRefreshAfterDelay]
  );

  // Keep the ref in sync so performRefresh can call scheduleRefresh without circular deps
  scheduleRefreshRef.current = scheduleRefresh;

  const storeTokensAndSchedule = useCallback(
    (accessTokenValue: string, refreshToken: string, expiresIn: number) => {
      setAccessToken(accessTokenValue);
      sessionStorage.setItem("accessToken", accessTokenValue);
      sessionStorage.setItem("refreshToken", refreshToken);
      const expiresAt = Date.now() + expiresIn * 1000;
      sessionStorage.setItem("tokenExpiresAt", expiresAt.toString());
      sessionStorage.setItem("tokenLifetimeMs", (expiresIn * 1000).toString());
      scheduleRefresh(expiresIn);
    },
    [scheduleRefresh]
  );

  useEffect(() => {
    setOnRefreshTokens(performRefresh);
    setOnClearAuth(clearAuth);

    return () => {
      setOnRefreshTokens(null);
      setOnClearAuth(null);
      clearRefreshTimer();
    };
  }, [performRefresh, clearAuth, clearRefreshTimer]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await usersApi.getCurrentUser();
      setUser(userData);
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("accessToken");
    const storedRefreshToken = sessionStorage.getItem("refreshToken");

    if (storedToken && storedRefreshToken) {
      setAccessToken(storedToken);

      const expiresAt = sessionStorage.getItem("tokenExpiresAt");
      if (expiresAt) {
        const remainingMs = Number.parseInt(expiresAt, 10) - Date.now();
        if (remainingMs <= 0) {
          performRefresh();
        } else {
          const tokenLifetimeMs = Number.parseInt(
            sessionStorage.getItem("tokenLifetimeMs") || "900000",
            10
          );
          const refreshAtMs = tokenLifetimeMs * REFRESH_THRESHOLD;
          const elapsedMs = tokenLifetimeMs - remainingMs;
          const delayMs = refreshAtMs - elapsedMs;
          if (delayMs <= 0) {
            performRefresh();
          } else {
            scheduleRefreshAfterDelay(delayMs / 1000);
          }
        }
      }

      fetchCurrentUser().finally(() => setIsLoading(false));
    } else if (storedToken) {
      setAccessToken(storedToken);
      fetchCurrentUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, performRefresh, scheduleRefreshAfterDelay]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      storeTokensAndSchedule(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.tokens.expiresIn
      );
      setUser(response.user);
    },
    [storeTokensAndSchedule]
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const response = await authApi.register({
        email,
        password,
        displayName,
      });
      storeTokensAndSchedule(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.tokens.expiresIn
      );
      setUser(response.user);
    },
    [storeTokensAndSchedule]
  );

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await usersApi.getCurrentUser();
      setUser(userData);
    } catch {
      // ignore - user data might be stale but that's ok
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
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
