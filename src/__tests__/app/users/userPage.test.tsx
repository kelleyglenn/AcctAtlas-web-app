import { generateMetadata } from "@/app/users/[id]/page";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("users/[id]/page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("generateMetadata", () => {
    it("returns display name on successful fetch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ displayName: "Jane Doe" }),
      });

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "user-123" }),
      });

      expect(metadata).toEqual({ title: "Jane Doe" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/user-123"),
        expect.any(Object)
      );
    });

    it("returns fallback title when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "bad-id" }),
      });

      expect(metadata).toEqual({ title: "User Profile" });
    });

    it("returns fallback title when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "error-id" }),
      });

      expect(metadata).toEqual({ title: "User Profile" });
    });

    it("returns fallback title when user has no displayName", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ displayName: "" }),
      });

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "no-name" }),
      });

      expect(metadata).toEqual({ title: "User Profile" });
    });
  });
});
