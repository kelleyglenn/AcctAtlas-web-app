jest.mock("axios", () => ({
  isAxiosError: jest.fn(),
}));

jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import axios from "axios";
import { apiClient } from "@/lib/api/client";
import { searchVideos, SearchError } from "@/lib/api/search";

describe("api/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeApiResponse = (
    results: unknown[] = [],
    pagination = { page: 0, size: 20, totalElements: 0, totalPages: 0 }
  ) => ({
    results,
    pagination,
  });

  const makeResult = (overrides: Record<string, unknown> = {}) => ({
    id: "video-1",
    youtubeId: "yt-1",
    title: "Test Video",
    amendments: ["1st", "2nd"],
    participants: ["Alice", "Bob", "Charlie"],
    locations: [
      {
        id: "loc-1",
        displayName: "New York",
        city: "New York",
        state: "NY",
        coordinates: { latitude: 40.7128, longitude: -74.006 },
      },
    ],
    ...overrides,
  });

  describe("transformSearchResponse", () => {
    it("filters out results with no locations", async () => {
      const apiResponse = makeApiResponse([
        makeResult(),
        makeResult({ id: "video-2", locations: [] }),
        makeResult({ id: "video-3", locations: undefined }),
      ]);

      (apiClient.get as jest.Mock).mockResolvedValue({ data: apiResponse });

      const result = await searchVideos({ page: 0, pageSize: 20 });

      expect(result.videos).toHaveLength(1);
      expect(result.videos[0].videoId).toBe("video-1");
    });

    it("flattens coordinates from nested to flat lat/lng", async () => {
      const apiResponse = makeApiResponse([makeResult()]);

      (apiClient.get as jest.Mock).mockResolvedValue({ data: apiResponse });

      const result = await searchVideos({ page: 0, pageSize: 20 });

      expect(result.videos[0].latitude).toBe(40.7128);
      expect(result.videos[0].longitude).toBe(-74.006);
    });

    it("maps participants.length to participantCount", async () => {
      const apiResponse = makeApiResponse([
        makeResult({ participants: ["Alice", "Bob", "Charlie"] }),
      ]);

      (apiClient.get as jest.Mock).mockResolvedValue({ data: apiResponse });

      const result = await searchVideos({ page: 0, pageSize: 20 });

      expect(result.videos[0].participantCount).toBe(3);
    });
  });

  describe("query parameter handling", () => {
    it("passes bbox as comma-separated string", async () => {
      const apiResponse = makeApiResponse();
      (apiClient.get as jest.Mock).mockResolvedValue({ data: apiResponse });

      await searchVideos({
        page: 0,
        pageSize: 20,
        bbox: [-74.1, 40.6, -73.9, 40.8],
      });

      const callParams = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      expect(callParams.bbox).toBe("-74.1,40.6,-73.9,40.8");
    });

    it("passes amendments as comma-separated string", async () => {
      const apiResponse = makeApiResponse();
      (apiClient.get as jest.Mock).mockResolvedValue({ data: apiResponse });

      await searchVideos({ page: 0, pageSize: 20, amendments: ["1st", "4th"] });

      const callParams = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      expect(callParams.amendments).toBe("1st,4th");
    });

    it("passes participants as comma-separated string", async () => {
      const apiResponse = makeApiResponse();
      (apiClient.get as jest.Mock).mockResolvedValue({ data: apiResponse });

      await searchVideos({
        page: 0,
        pageSize: 20,
        participants: ["Alice", "Bob"],
      });

      const callParams = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      expect(callParams.participants).toBe("Alice,Bob");
    });

    it("filters out undefined params", async () => {
      const apiResponse = makeApiResponse();
      (apiClient.get as jest.Mock).mockResolvedValue({ data: apiResponse });

      await searchVideos({ page: 0, pageSize: 20 });

      const callParams = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      expect(callParams).toHaveProperty("page", 0);
      expect(callParams).toHaveProperty("pageSize", 20);
      expect(callParams).not.toHaveProperty("query");
      expect(callParams).not.toHaveProperty("dateFrom");
      expect(callParams).not.toHaveProperty("dateTo");
      expect(callParams).not.toHaveProperty("bbox");
      expect(callParams).not.toHaveProperty("amendments");
      expect(callParams).not.toHaveProperty("participants");
    });
  });

  describe("error handling", () => {
    it("wraps Axios errors in SearchError with statusCode", async () => {
      const axiosError = {
        response: { status: 404, data: { message: "Not found" } },
        message: "Request failed",
      };

      (apiClient.get as jest.Mock).mockRejectedValue(axiosError);
      (axios.isAxiosError as jest.Mock).mockReturnValue(true);

      const error = await searchVideos({ page: 0, pageSize: 20 }).catch(
        (e) => e
      );

      expect(error).toBeInstanceOf(SearchError);
      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
      expect(error.originalError).toBe(axiosError);
    });

    it("wraps non-Axios errors in SearchError with 'An unexpected error occurred'", async () => {
      const genericError = new Error("something broke");

      (apiClient.get as jest.Mock).mockRejectedValue(genericError);
      (axios.isAxiosError as jest.Mock).mockReturnValue(false);

      const error = await searchVideos({ page: 0, pageSize: 20 }).catch(
        (e) => e
      );

      expect(error).toBeInstanceOf(SearchError);
      expect(error.message).toBe("An unexpected error occurred");
      expect(error.statusCode).toBeUndefined();
      expect(error.originalError).toBe(genericError);
    });
  });

  describe("SearchError", () => {
    it("has correct name and properties", () => {
      const originalError = new Error("original");
      const searchError = new SearchError("test message", 500, originalError);

      expect(searchError.name).toBe("SearchError");
      expect(searchError.message).toBe("test message");
      expect(searchError.statusCode).toBe(500);
      expect(searchError.originalError).toBe(originalError);
      expect(searchError).toBeInstanceOf(Error);
    });
  });
});
