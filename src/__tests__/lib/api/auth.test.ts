jest.mock("@/lib/api/client", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { login, register, refreshTokens } from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";

describe("api/auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("calls apiClient.post with /auth/login and returns response.data", async () => {
      const loginData = { email: "user@example.com", password: "password123" };
      const responseData = { accessToken: "jwt-token", user: { id: "1" } };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await login(loginData);

      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", loginData);
      expect(result).toEqual(responseData);
    });
  });

  describe("register", () => {
    it("calls apiClient.post with /auth/register and returns response.data", async () => {
      const registerData = {
        email: "newuser@example.com",
        password: "password123",
        username: "newuser",
      };
      const responseData = { id: "1", email: "newuser@example.com" };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/auth/register",
        registerData
      );
      expect(result).toEqual(responseData);
    });
  });

  describe("refreshTokens", () => {
    it("calls apiClient.post with /auth/refresh and returns response.data", async () => {
      const responseData = {
        tokens: {
          accessToken: "new-access",
          refreshToken: "new-refresh",
          expiresIn: 900,
          tokenType: "Bearer",
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await refreshTokens("old-refresh-token");

      expect(apiClient.post).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken: "old-refresh-token",
      });
      expect(result).toEqual(responseData);
    });
  });
});
