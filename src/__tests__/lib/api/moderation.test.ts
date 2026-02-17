jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import {
  getModerationQueue,
  approveItem,
  rejectItem,
  getModerationItemByContentId,
} from "@/lib/api/moderation";
import { apiClient } from "@/lib/api/client";

describe("api/moderation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getModerationQueue", () => {
    it("calls GET /moderation/queue with correct params", async () => {
      const queueData = {
        content: [
          {
            id: "mod-1",
            contentType: "VIDEO",
            contentId: "video-1",
            submitterId: "user-1",
            status: "PENDING",
            createdAt: "2024-06-15T00:00:00Z",
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: queueData });

      const params = {
        status: "PENDING",
        contentType: "VIDEO",
        page: 0,
        size: 20,
      };
      const result = await getModerationQueue(params);

      expect(apiClient.get).toHaveBeenCalledWith("/moderation/queue", {
        params,
      });
      expect(result).toEqual(queueData);
    });

    it("passes empty params when no filters provided", async () => {
      const queueData = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: queueData });

      const result = await getModerationQueue({});

      expect(apiClient.get).toHaveBeenCalledWith("/moderation/queue", {
        params: {},
      });
      expect(result).toEqual(queueData);
    });
  });

  describe("approveItem", () => {
    it("calls POST /moderation/queue/{id}/approve", async () => {
      const approvedItem = {
        id: "mod-1",
        contentType: "VIDEO",
        contentId: "video-1",
        submitterId: "user-1",
        status: "APPROVED",
        reviewerId: "admin-1",
        reviewedAt: "2024-06-16T00:00:00Z",
        createdAt: "2024-06-15T00:00:00Z",
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: approvedItem });

      const result = await approveItem("mod-1");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/moderation/queue/mod-1/approve"
      );
      expect(result).toEqual(approvedItem);
    });
  });

  describe("rejectItem", () => {
    it("calls POST /moderation/queue/{id}/reject with reason body", async () => {
      const rejectedItem = {
        id: "mod-2",
        contentType: "VIDEO",
        contentId: "video-2",
        submitterId: "user-2",
        status: "REJECTED",
        reviewerId: "admin-1",
        reviewedAt: "2024-06-16T00:00:00Z",
        rejectionReason: "Duplicate content",
        createdAt: "2024-06-15T00:00:00Z",
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: rejectedItem });

      const result = await rejectItem("mod-2", "Duplicate content");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/moderation/queue/mod-2/reject",
        { reason: "Duplicate content" }
      );
      expect(result).toEqual(rejectedItem);
    });
  });

  describe("getModerationItemByContentId", () => {
    it("calls GET /moderation/queue/by-content/{contentId} with default PENDING status", async () => {
      const item = {
        id: "mod-1",
        contentType: "VIDEO",
        contentId: "video-1",
        submitterId: "user-1",
        status: "PENDING",
        createdAt: "2024-06-15T00:00:00Z",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: item });

      const result = await getModerationItemByContentId("video-1");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/moderation/queue/by-content/video-1",
        { params: { status: "PENDING" } }
      );
      expect(result).toEqual(item);
    });

    it("passes custom status parameter", async () => {
      const item = {
        id: "mod-1",
        contentType: "VIDEO",
        contentId: "video-1",
        submitterId: "user-1",
        status: "APPROVED",
        createdAt: "2024-06-15T00:00:00Z",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: item });

      const result = await getModerationItemByContentId(
        "video-1",
        "APPROVED"
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        "/moderation/queue/by-content/video-1",
        { params: { status: "APPROVED" } }
      );
      expect(result).toEqual(item);
    });

    it("returns null when API responds with 404", async () => {
      const axiosError = new Error("Not Found") as Error & {
        isAxiosError: boolean;
        response: { status: number };
      };
      axiosError.isAxiosError = true;
      axiosError.response = { status: 404 };

      (apiClient.get as jest.Mock).mockRejectedValue(axiosError);

      const result = await getModerationItemByContentId("nonexistent");

      expect(result).toBeNull();
    });

    it("re-throws non-404 errors", async () => {
      const axiosError = new Error("Internal Server Error") as Error & {
        isAxiosError: boolean;
        response: { status: number };
      };
      axiosError.isAxiosError = true;
      axiosError.response = { status: 500 };

      (apiClient.get as jest.Mock).mockRejectedValue(axiosError);

      await expect(
        getModerationItemByContentId("video-1")
      ).rejects.toThrow("Internal Server Error");
    });

    it("re-throws non-axios errors", async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(
        new TypeError("Network failure")
      );

      await expect(
        getModerationItemByContentId("video-1")
      ).rejects.toThrow("Network failure");
    });
  });
});
