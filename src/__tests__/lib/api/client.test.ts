import {
  apiClient,
  setAccessToken,
  getAccessToken,
  setOnRefreshTokens,
  setOnClearAuth,
} from "@/lib/api/client";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

// Helper types for accessing axios internals
type InterceptorHandler<T> = {
  fulfilled: (value: T) => T | Promise<T>;
  rejected?: (error: unknown) => unknown;
};

type InterceptorManager<T> = {
  handlers: Array<InterceptorHandler<T>>;
};

function getResponseErrorHandler() {
  const interceptors = apiClient.interceptors
    .response as unknown as InterceptorManager<unknown>;
  return interceptors.handlers[0].rejected!;
}

function getResponseSuccessHandler() {
  const interceptors = apiClient.interceptors
    .response as unknown as InterceptorManager<unknown>;
  return interceptors.handlers[0].fulfilled;
}

describe("api/client", () => {
  let mockAdapter: jest.Mock;

  beforeEach(() => {
    setAccessToken(null);
    setOnRefreshTokens(null);
    setOnClearAuth(null);
    // Mock the adapter so retry calls don't make real HTTP requests
    mockAdapter = jest.fn().mockResolvedValue({
      data: "retried",
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    apiClient.defaults.adapter = mockAdapter;
  });

  afterEach(() => {
    delete apiClient.defaults.adapter;
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

  describe("response interceptor", () => {
    it("passes successful responses through unchanged", () => {
      const successHandler = getResponseSuccessHandler();
      const mockResponse = { data: "test", status: 200 };
      expect(successHandler(mockResponse)).toBe(mockResponse);
    });

    it("rejects non-401 errors without attempting refresh", async () => {
      const errorHandler = getResponseErrorHandler();
      const error = {
        response: { status: 500 },
        config: { url: "/some-endpoint", headers: {} },
      } as unknown as AxiosError;

      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("rejects 401 errors on /auth/refresh endpoint without attempting refresh", async () => {
      const errorHandler = getResponseErrorHandler();
      const error = {
        response: { status: 401 },
        config: { url: "/auth/refresh", headers: {} },
      } as unknown as AxiosError;

      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("calls onRefreshTokens and retries the original request on 401", async () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);
      setOnRefreshTokens(mockRefresh);

      const errorHandler = getResponseErrorHandler();
      const originalConfig = {
        url: "/users/me",
        headers: {},
      } as InternalAxiosRequestConfig & { _retry?: boolean };

      const error = {
        response: { status: 401 },
        config: originalConfig,
      } as unknown as AxiosError;

      const result = await errorHandler(error);

      expect(mockRefresh).toHaveBeenCalled();
      expect(mockAdapter).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({ data: "retried", status: 200 })
      );
    });

    it("clears auth and rejects when refresh fails", async () => {
      const mockRefresh = jest
        .fn()
        .mockRejectedValue(new Error("Refresh failed"));
      const mockClearAuth = jest.fn();
      setOnRefreshTokens(mockRefresh);
      setOnClearAuth(mockClearAuth);

      const errorHandler = getResponseErrorHandler();
      const originalConfig = {
        url: "/users/me",
        headers: {},
      } as InternalAxiosRequestConfig & { _retry?: boolean };

      const error = {
        response: { status: 401 },
        config: originalConfig,
      } as unknown as AxiosError;

      await expect(errorHandler(error)).rejects.toBe(error);
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockClearAuth).toHaveBeenCalled();
    });

    it("clears auth when no refresh handler is registered", async () => {
      const mockClearAuth = jest.fn();
      setOnClearAuth(mockClearAuth);
      // setOnRefreshTokens is null (default from beforeEach)

      const errorHandler = getResponseErrorHandler();
      const originalConfig = {
        url: "/users/me",
        headers: {},
      } as InternalAxiosRequestConfig & { _retry?: boolean };

      const error = {
        response: { status: 401 },
        config: originalConfig,
      } as unknown as AxiosError;

      await expect(errorHandler(error)).rejects.toBe(error);
      expect(mockClearAuth).toHaveBeenCalled();
    });

    it("queues concurrent 401 requests and retries them after refresh", async () => {
      const mockRefresh = jest
        .fn()
        .mockImplementation(
          () => new Promise<void>((resolve) => setTimeout(resolve, 50))
        );
      setOnRefreshTokens(mockRefresh);

      const errorHandler = getResponseErrorHandler();

      // First 401 request triggers the refresh
      const config1 = {
        url: "/endpoint-1",
        headers: {},
      } as InternalAxiosRequestConfig & { _retry?: boolean };
      const error1 = {
        response: { status: 401 },
        config: config1,
      } as unknown as AxiosError;

      // Second 401 request while refresh is in progress should be queued
      const config2 = {
        url: "/endpoint-2",
        headers: {},
      } as InternalAxiosRequestConfig & { _retry?: boolean };
      const error2 = {
        response: { status: 401 },
        config: config2,
      } as unknown as AxiosError;

      const promise1 = errorHandler(error1);
      const promise2 = errorHandler(error2);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Only one refresh call should have been made
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      // Both requests should have been retried via the adapter
      expect(mockAdapter).toHaveBeenCalledTimes(2);
      expect(result1).toEqual(
        expect.objectContaining({ data: "retried", status: 200 })
      );
      expect(result2).toEqual(
        expect.objectContaining({ data: "retried", status: 200 })
      );
    });

    it("rejects queued requests when refresh fails", async () => {
      const mockRefresh = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error("Refresh failed")), 50)
            )
        );
      const mockClearAuth = jest.fn();
      setOnRefreshTokens(mockRefresh);
      setOnClearAuth(mockClearAuth);

      const errorHandler = getResponseErrorHandler();

      const config1 = {
        url: "/endpoint-1",
        headers: {},
      } as InternalAxiosRequestConfig & { _retry?: boolean };
      const error1 = {
        response: { status: 401 },
        config: config1,
      } as unknown as AxiosError;

      const config2 = {
        url: "/endpoint-2",
        headers: {},
      } as InternalAxiosRequestConfig & { _retry?: boolean };
      const error2 = {
        response: { status: 401 },
        config: config2,
      } as unknown as AxiosError;

      const promise1 = errorHandler(error1);
      const promise2 = errorHandler(error2);

      // First promise rejects with original error
      await expect(promise1).rejects.toBe(error1);
      // Second (queued) promise rejects with the refresh error
      await expect(promise2).rejects.toEqual(new Error("Refresh failed"));

      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(mockClearAuth).toHaveBeenCalled();
    });
  });
});
