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
});
