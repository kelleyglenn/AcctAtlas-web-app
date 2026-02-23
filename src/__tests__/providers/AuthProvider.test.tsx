import { renderHook, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import {
  setAccessToken,
  setOnRefreshTokens,
  setOnClearAuth,
} from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import type { ReactNode } from "react";
import type { LoginResponse, RegisterResponse, User } from "@/types/api";

jest.mock("@/lib/api/client", () => ({
  setAccessToken: jest.fn(),
  setOnRefreshTokens: jest.fn(),
  setOnClearAuth: jest.fn(),
}));

jest.mock("@/lib/api/auth", () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshTokens: jest.fn(),
}));

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: jest.fn(),
}));

const mockSetAccessToken = setAccessToken as jest.MockedFunction<
  typeof setAccessToken
>;
const mockSetOnRefreshTokens = setOnRefreshTokens as jest.MockedFunction<
  typeof setOnRefreshTokens
>;
const mockSetOnClearAuth = setOnClearAuth as jest.MockedFunction<
  typeof setOnClearAuth
>;
const mockLogin = authApi.login as jest.MockedFunction<typeof authApi.login>;
const mockRegister = authApi.register as jest.MockedFunction<
  typeof authApi.register
>;
const mockLogout = authApi.logout as jest.MockedFunction<typeof authApi.logout>;
const mockRefreshTokens = authApi.refreshTokens as jest.MockedFunction<
  typeof authApi.refreshTokens
>;
const mockGetCurrentUser = usersApi.getCurrentUser as jest.MockedFunction<
  typeof usersApi.getCurrentUser
>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  emailVerified: true,
  displayName: "Test User",
  trustTier: "BASIC",
  createdAt: "2024-01-01T00:00:00Z",
};

const mockLoginResponse: LoginResponse = {
  user: mockUser,
  tokens: {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
    expiresIn: 3600,
    tokenType: "Bearer",
  },
};

const mockRegisterResponse: RegisterResponse = {
  user: mockUser,
  tokens: {
    accessToken: "register-access-token",
    refreshToken: "register-refresh-token",
    expiresIn: 3600,
    tokenType: "Bearer",
  },
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  describe("initial state", () => {
    it("should have isAuthenticated false and user null when no stored token", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it("should start with isLoading true", () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // isLoading starts as true before the useEffect runs
      // It will quickly become false since there's no stored token
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    it("should call authApi.login and set user and token", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockSetAccessToken).toHaveBeenCalledWith("test-access-token");
      expect(sessionStorage.getItem("accessToken")).toBe("test-access-token");
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("register", () => {
    it("should call authApi.register and set user and token", async () => {
      mockRegister.mockResolvedValueOnce(mockRegisterResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register(
          "test@example.com",
          "password123",
          "Test User"
        );
      });

      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });
      expect(mockSetAccessToken).toHaveBeenCalledWith("register-access-token");
      expect(sessionStorage.getItem("accessToken")).toBe(
        "register-access-token"
      );
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("logout", () => {
    it("should clear user, token, and sessionStorage", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);
      mockLogout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
      expect(sessionStorage.getItem("accessToken")).toBeNull();
      expect(mockLogout).toHaveBeenCalled();
    });

    it("should clear state even when backend logout fails", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);
      mockLogout.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
      expect(sessionStorage.getItem("accessToken")).toBeNull();
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("session restore", () => {
    it("should restore session when token exists in sessionStorage", async () => {
      sessionStorage.setItem("accessToken", "stored-token");
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith("stored-token");
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should clear user and token when getCurrentUser fails", async () => {
      sessionStorage.setItem("accessToken", "invalid-token");
      mockGetCurrentUser.mockRejectedValueOnce(new Error("Unauthorized"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith("invalid-token");
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      // setAccessToken should be called with null in the catch block
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
    });
  });

  describe("refresh token storage", () => {
    it("should store refresh token in sessionStorage on login", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(sessionStorage.getItem("refreshToken")).toBe("test-refresh-token");
    });

    it("should store refresh token in sessionStorage on register", async () => {
      mockRegister.mockResolvedValueOnce(mockRegisterResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register(
          "test@example.com",
          "password123",
          "Test User"
        );
      });

      expect(sessionStorage.getItem("refreshToken")).toBe(
        "register-refresh-token"
      );
    });

    it("should clear refresh token on logout", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);
      mockLogout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(sessionStorage.getItem("refreshToken")).toBe("test-refresh-token");

      act(() => {
        result.current.logout();
      });

      expect(sessionStorage.getItem("refreshToken")).toBeNull();
    });
  });

  describe("callback registration", () => {
    it("should register onRefreshTokens and onClearAuth callbacks on mount", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSetOnRefreshTokens).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetOnClearAuth).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("performRefresh via registered callback", () => {
    it("should refresh tokens when onRefreshTokens callback is called", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);
      const refreshResponse = {
        tokens: {
          accessToken: "refreshed-access",
          refreshToken: "refreshed-refresh",
          expiresIn: 900,
          tokenType: "Bearer",
        },
      };
      mockRefreshTokens.mockResolvedValueOnce(refreshResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first to populate sessionStorage with a refresh token
      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(sessionStorage.getItem("refreshToken")).toBe("test-refresh-token");

      // Get the performRefresh callback registered via setOnRefreshTokens
      const registeredRefreshFn = mockSetOnRefreshTokens.mock.calls[0][0];

      // Call it (simulating the interceptor triggering a refresh)
      await act(async () => {
        await registeredRefreshFn();
      });

      expect(mockRefreshTokens).toHaveBeenCalledWith("test-refresh-token");
      expect(mockSetAccessToken).toHaveBeenCalledWith("refreshed-access");
      expect(sessionStorage.getItem("accessToken")).toBe("refreshed-access");
      expect(sessionStorage.getItem("refreshToken")).toBe("refreshed-refresh");
    });

    it("should clear auth when refresh fails", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);
      mockRefreshTokens.mockRejectedValueOnce(new Error("Token expired"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      const registeredRefreshFn = mockSetOnRefreshTokens.mock.calls[0][0];

      await act(async () => {
        await registeredRefreshFn();
      });

      // Auth should be cleared
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
      expect(sessionStorage.getItem("accessToken")).toBeNull();
      expect(sessionStorage.getItem("refreshToken")).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should clear auth when no refresh token is available", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // No login, so no refresh token in sessionStorage
      const registeredRefreshFn = mockSetOnRefreshTokens.mock.calls[0][0];

      await act(async () => {
        await registeredRefreshFn();
      });

      expect(mockRefreshTokens).not.toHaveBeenCalled();
      expect(mockSetAccessToken).toHaveBeenCalledWith(null);
    });
  });

  describe("session restore with refresh token", () => {
    it("should restore session with both tokens and schedule refresh", async () => {
      sessionStorage.setItem("accessToken", "stored-access");
      sessionStorage.setItem("refreshToken", "stored-refresh");
      sessionStorage.setItem(
        "tokenExpiresAt",
        (Date.now() + 600000).toString()
      );
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith("stored-access");
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should refresh immediately when token is expired on restore", async () => {
      sessionStorage.setItem("accessToken", "stored-access");
      sessionStorage.setItem("refreshToken", "stored-refresh");
      sessionStorage.setItem("tokenExpiresAt", (Date.now() - 1000).toString());
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);
      mockRefreshTokens.mockResolvedValueOnce({
        tokens: {
          accessToken: "refreshed-access",
          refreshToken: "refreshed-refresh",
          expiresIn: 900,
          tokenType: "Bearer",
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockRefreshTokens).toHaveBeenCalledWith("stored-refresh");
    });

    it("should refresh when token remaining fraction is below threshold", async () => {
      // Set tokenExpiresAt so that remainingMs/totalLifetimeMs <= 0.2 (1 - REFRESH_THRESHOLD of 0.8)
      // totalLifetimeMs = 900 * 1000 = 900000
      // If remaining is 100000ms, fraction = 100000/900000 = 0.111 which is <= 0.2
      sessionStorage.setItem("accessToken", "stored-access");
      sessionStorage.setItem("refreshToken", "stored-refresh");
      sessionStorage.setItem(
        "tokenExpiresAt",
        (Date.now() + 100000).toString()
      );
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);
      mockRefreshTokens.mockResolvedValueOnce({
        tokens: {
          accessToken: "refreshed-access",
          refreshToken: "refreshed-refresh",
          expiresIn: 900,
          tokenType: "Bearer",
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockRefreshTokens).toHaveBeenCalledWith("stored-refresh");
    });

    it("should schedule refresh when token has enough remaining time", async () => {
      // Set tokenExpiresAt so that remainingMs/totalLifetimeMs > 0.2
      // totalLifetimeMs = 900000, if remaining = 800000ms, fraction = 0.888 > 0.2
      sessionStorage.setItem("accessToken", "stored-access");
      sessionStorage.setItem("refreshToken", "stored-refresh");
      sessionStorage.setItem(
        "tokenExpiresAt",
        (Date.now() + 800000).toString()
      );
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should NOT have called refresh immediately
      expect(mockRefreshTokens).not.toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should restore session with both tokens but no expiresAt", async () => {
      sessionStorage.setItem("accessToken", "stored-access");
      sessionStorage.setItem("refreshToken", "stored-refresh");
      // No tokenExpiresAt set
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith("stored-access");
      // Should NOT call refresh since there's no expiresAt to evaluate
      expect(mockRefreshTokens).not.toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should restore session with access token only (no refresh token)", async () => {
      sessionStorage.setItem("accessToken", "stored-access");
      // No refreshToken set
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith("stored-access");
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("scheduleRefresh timer", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should call performRefresh when the scheduled timer fires", async () => {
      jest.useRealTimers();
      mockLogin.mockResolvedValueOnce({
        user: mockUser,
        tokens: {
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          expiresIn: 1, // 1 second so the timer fires at 0.8s
          tokenType: "Bearer",
        },
      });

      const refreshResponse = {
        tokens: {
          accessToken: "refreshed-access",
          refreshToken: "refreshed-refresh",
          expiresIn: 900,
          tokenType: "Bearer",
        },
      };
      mockRefreshTokens.mockResolvedValueOnce(refreshResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      // Wait for the scheduled refresh timer to fire (0.8 * 1000ms = 800ms)
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      expect(mockRefreshTokens).toHaveBeenCalledWith("test-refresh-token");
    });
  });

  describe("refreshUser", () => {
    it("should update user data when refreshUser succeeds", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      const updatedUser = { ...mockUser, displayName: "Updated Name" };
      mockGetCurrentUser.mockResolvedValueOnce(updatedUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toEqual(updatedUser);
    });

    it("should silently ignore errors when refreshUser fails", async () => {
      mockLogin.mockResolvedValueOnce(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      mockGetCurrentUser.mockRejectedValueOnce(new Error("Network error"));

      // Should not throw
      await act(async () => {
        await result.current.refreshUser();
      });

      // User should remain unchanged (the error is silently caught)
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("useAuth hook outside provider", () => {
    it("should throw error when used outside AuthProvider", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });
});
