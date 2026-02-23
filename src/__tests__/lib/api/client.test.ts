import {
  apiClient,
  setAccessToken,
  getAccessToken,
  setOnRefreshTokens,
  setOnClearAuth,
} from "@/lib/api/client";

describe("api/client", () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  describe("setAccessToken / getAccessToken", () => {
    it("stores a token and retrieves it", () => {
      setAccessToken("my-token");
      expect(getAccessToken()).toBe("my-token");
    });

    it("clears the token when set to null", () => {
      setAccessToken("my-token");
      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });
  });

  describe("request interceptor", () => {
    it("adds Bearer header when token is set", () => {
      setAccessToken("test-token");

      const config = { headers: {} as Record<string, string> };
      const result = (
        apiClient.interceptors.request as unknown as {
          handlers: Array<{
            fulfilled: (config: unknown) => unknown;
          }>;
        }
      ).handlers[0].fulfilled(config);

      expect(
        (result as { headers: Record<string, string> }).headers.Authorization
      ).toBe("Bearer test-token");
    });

    it("does not add Authorization header when no token is set", () => {
      const config = { headers: {} as Record<string, string> };
      const result = (
        apiClient.interceptors.request as unknown as {
          handlers: Array<{
            fulfilled: (config: unknown) => unknown;
          }>;
        }
      ).handlers[0].fulfilled(config);

      expect(
        (result as { headers: Record<string, string> }).headers.Authorization
      ).toBeUndefined();
    });
  });

  describe("apiClient defaults", () => {
    it("has the correct baseURL", () => {
      expect(apiClient.defaults.baseURL).toBe("http://localhost:8080/api/v1");
    });
  });

  describe("callback registration", () => {
    it("exports setOnRefreshTokens as a function", () => {
      expect(typeof setOnRefreshTokens).toBe("function");
    });

    it("exports setOnClearAuth as a function", () => {
      expect(typeof setOnClearAuth).toBe("function");
    });

    it("accepts a callback for setOnRefreshTokens", () => {
      const fn = jest.fn().mockResolvedValue(undefined);
      expect(() => setOnRefreshTokens(fn)).not.toThrow();
      setOnRefreshTokens(null);
    });

    it("accepts a callback for setOnClearAuth", () => {
      const fn = jest.fn();
      expect(() => setOnClearAuth(fn)).not.toThrow();
      setOnClearAuth(null);
    });
  });
});
