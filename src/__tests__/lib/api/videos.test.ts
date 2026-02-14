jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { getVideo, previewVideo, createVideo } from "@/lib/api/videos";
import { apiClient } from "@/lib/api/client";

describe("api/videos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getVideo", () => {
    it("calls apiClient.get with /videos/{id} and returns response.data", async () => {
      const videoData = {
        id: "video-123",
        title: "Test Video",
        youtubeId: "yt-abc",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: videoData });

      const result = await getVideo("video-123");

      expect(apiClient.get).toHaveBeenCalledWith("/videos/video-123");
      expect(result).toEqual(videoData);
    });
  });

  describe("previewVideo", () => {
    it("calls apiClient.get with /videos/preview and youtubeUrl param", async () => {
      const previewData = {
        youtubeId: "dQw4w9WgXcQ",
        title: "Test Video",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
        channelId: "channel-1",
        channelName: "Test Channel",
        publishedAt: "2024-01-01T00:00:00Z",
        alreadyExists: false,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: previewData });

      const result = await previewVideo(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );

      expect(apiClient.get).toHaveBeenCalledWith("/videos/preview", {
        params: { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      });
      expect(result).toEqual(previewData);
    });
  });

  describe("createVideo", () => {
    it("calls apiClient.post with /videos and request body, returns response.data", async () => {
      const requestData = {
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        amendments: ["FIRST", "FOURTH"],
        participants: ["POLICE"],
        videoDate: "2024-06-15",
        locationId: "loc-123",
      };

      const responseData = {
        id: "video-456",
        youtubeId: "dQw4w9WgXcQ",
        title: "Test Video",
        channelId: "channel-1",
        channelName: "Test Channel",
        publishedAt: "2024-01-01T00:00:00Z",
        amendments: ["FIRST", "FOURTH"],
        participants: ["POLICE"],
        status: "PENDING",
        submittedBy: "user-1",
        createdAt: "2024-06-15T00:00:00Z",
        locations: [],
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await createVideo(requestData);

      expect(apiClient.post).toHaveBeenCalledWith("/videos", requestData);
      expect(result).toEqual(responseData);
    });
  });
});
