jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import {
  getClusters,
  getLocation,
  createLocation,
  reverseGeocode,
} from "@/lib/api/locations";
import { apiClient } from "@/lib/api/client";

describe("api/locations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getClusters", () => {
    const mockApiResponse = {
      clusters: [
        {
          id: "cluster-1",
          coordinates: { latitude: 40.7128, longitude: -74.006 },
          count: 5,
          sampleVideoIds: ["vid-1", "vid-2"],
        },
        {
          id: "cluster-2",
          coordinates: { latitude: 34.0522, longitude: -118.2437 },
          count: 3,
          sampleVideoIds: undefined,
        },
      ],
      totalLocations: 8,
      zoom: 10,
    };

    it("transforms API response coordinates from nested to flat lat/lng", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockApiResponse });

      const result = await getClusters({
        bbox: [-74.1, 40.6, -73.9, 40.8],
        zoom: 10,
      });

      expect(result.clusters[0].latitude).toBe(40.7128);
      expect(result.clusters[0].longitude).toBe(-74.006);
      expect(result.clusters[1].latitude).toBe(34.0522);
      expect(result.clusters[1].longitude).toBe(-118.2437);
    });

    it("passes bbox as a comma-separated string", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockApiResponse });

      await getClusters({ bbox: [-74.1, 40.6, -73.9, 40.8], zoom: 10 });

      expect(apiClient.get).toHaveBeenCalledWith("/locations/cluster", {
        params: {
          bbox: "-74.1,40.6,-73.9,40.8",
          zoom: 10,
        },
      });
    });

    it("passes zoom parameter", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockApiResponse });

      await getClusters({ bbox: [-74.1, 40.6, -73.9, 40.8], zoom: 15 });

      expect(apiClient.get).toHaveBeenCalledWith("/locations/cluster", {
        params: expect.objectContaining({ zoom: 15 }),
      });
    });

    it("maps sampleVideoIds to videoIds", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockApiResponse });

      const result = await getClusters({
        bbox: [-74.1, 40.6, -73.9, 40.8],
        zoom: 10,
      });

      expect(result.clusters[0].videoIds).toEqual(["vid-1", "vid-2"]);
      expect(result.clusters[1].videoIds).toBeUndefined();
    });

    it("returns zoom from the API response", async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockApiResponse });

      const result = await getClusters({
        bbox: [-74.1, 40.6, -73.9, 40.8],
        zoom: 10,
      });

      expect(result.zoom).toBe(10);
    });
  });

  describe("getLocation", () => {
    it("calls GET with correct path and returns response.data", async () => {
      const locationData = {
        id: "loc-1",
        displayName: "New York",
        city: "New York",
        state: "NY",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: locationData });

      const result = await getLocation("loc-1");

      expect(apiClient.get).toHaveBeenCalledWith("/locations/loc-1");
      expect(result).toEqual(locationData);
    });
  });

  describe("createLocation", () => {
    it("calls apiClient.post with /locations and request body, returns response.data", async () => {
      const requestData = {
        latitude: 40.7128,
        longitude: -74.006,
        displayName: "New York City Hall",
        address: "260 Broadway",
        city: "New York",
        state: "NY",
        country: "US",
      };

      const responseData = {
        id: "loc-new-1",
        displayName: "New York City Hall",
        address: "260 Broadway",
        city: "New York",
        state: "NY",
        country: "US",
        latitude: 40.7128,
        longitude: -74.006,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await createLocation(requestData);

      expect(apiClient.post).toHaveBeenCalledWith("/locations", requestData);
      expect(result).toEqual(responseData);
    });
  });

  describe("reverseGeocode", () => {
    it("calls apiClient.get with /locations/reverse and lat/lng params", async () => {
      const geocodeData = {
        displayName: "New York City Hall",
        address: "260 Broadway",
        city: "New York",
        state: "NY",
        country: "US",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: geocodeData });

      const result = await reverseGeocode(40.7128, -74.006);

      expect(apiClient.get).toHaveBeenCalledWith("/locations/reverse", {
        params: { lat: 40.7128, lng: -74.006 },
      });
      expect(result).toEqual(geocodeData);
    });
  });
});
