import { apiClient, setAccessToken, getAccessToken } from "@/lib/api/client";

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
});
