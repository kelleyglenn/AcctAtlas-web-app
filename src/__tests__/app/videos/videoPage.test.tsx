import { generateMetadata } from "@/app/videos/[id]/page";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("videos/[id]/page", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("generateMetadata", () => {
    it("returns video title on successful fetch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ title: "Test Video Title" }),
      });

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "abc-123" }),
      });

      expect(metadata).toEqual({ title: "Test Video Title" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/videos/abc-123"),
        expect.any(Object)
      );
    });

    it("returns fallback title when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "bad-id" }),
      });

      expect(metadata).toEqual({ title: "Video" });
    });

    it("returns fallback title when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "error-id" }),
      });

      expect(metadata).toEqual({ title: "Video" });
    });

    it("returns fallback title when video has no title", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ title: "" }),
      });

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "no-title" }),
      });

      expect(metadata).toEqual({ title: "Video" });
    });
  });
});
