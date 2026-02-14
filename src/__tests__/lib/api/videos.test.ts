jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import { getVideo } from "@/lib/api/videos";
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
});
