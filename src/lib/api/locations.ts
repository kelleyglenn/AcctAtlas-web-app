import { apiClient } from "./client";
import type { LocationDetails } from "@/types/map";
import type {
  CreateLocationRequest,
  CreateLocationResponse,
  ReverseGeocodeResponse,
} from "@/types/api";

/**
 * Get details for a specific location
 */
export async function getLocation(id: string): Promise<LocationDetails> {
  const response = await apiClient.get<LocationDetails>(`/locations/${id}`);
  return response.data;
}

/**
 * Create a new location
 */
export async function createLocation(
  data: CreateLocationRequest
): Promise<CreateLocationResponse> {
  const response = await apiClient.post<CreateLocationResponse>(
    "/locations",
    data
  );
  return response.data;
}

/**
 * Reverse geocode coordinates to get location details
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResponse> {
  const response = await apiClient.get<ReverseGeocodeResponse>(
    "/locations/reverse",
    { params: { latitude: lat, longitude: lng } }
  );
  return response.data;
}
