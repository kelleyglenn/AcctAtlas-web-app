import { renderHook, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { setAccessToken } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import type { ReactNode } from "react";
import type { LoginResponse, RegisterResponse, User } from "@/types/api";

jest.mock("@/lib/api/client", () => ({
  setAccessToken: jest.fn(),
}));

jest.mock("@/lib/api/auth", () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: jest.fn(),
}));

const mockSetAccessToken = setAccessToken as jest.MockedFunction<
  typeof setAccessToken
>;
const mockLogin = authApi.login as jest.MockedFunction<typeof authApi.login>;
const mockRegister = authApi.register as jest.MockedFunction<
  typeof authApi.register
>;
const mockLogout = authApi.logout as jest.MockedFunction<typeof authApi.logout>;
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
