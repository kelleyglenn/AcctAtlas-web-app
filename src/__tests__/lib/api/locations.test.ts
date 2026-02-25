jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import {
  getLocation,
  createLocation,
  reverseGeocode,
} from "@/lib/api/locations";
import { apiClient } from "@/lib/api/client";

describe("api/locations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        coordinates: { latitude: 40.7128, longitude: -74.006 },
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
    it("calls apiClient.get with /locations/reverse and latitude/longitude params", async () => {
      const geocodeData = {
        formattedAddress: "260 Broadway, New York, NY, US",
        address: "260 Broadway",
        city: "New York",
        state: "NY",
        country: "US",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: geocodeData });

      const result = await reverseGeocode(40.7128, -74.006);

      expect(apiClient.get).toHaveBeenCalledWith("/locations/reverse", {
        params: { latitude: 40.7128, longitude: -74.006 },
      });
      expect(result).toEqual(geocodeData);
    });
  });
});
