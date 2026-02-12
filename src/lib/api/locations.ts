import { apiClient } from "./client";
import type {
  ClusterParams,
  ClusterResponse,
  LocationDetails,
} from "@/types/map";

/**
 * Get clustered locations for a bounding box and zoom level
 */
export async function getClusters(
  params: ClusterParams
): Promise<ClusterResponse> {
  const response = await apiClient.get<ClusterResponse>("/locations/cluster", {
    params: {
      bbox: params.bbox.join(","),
      zoom: params.zoom,
    },
  });
  return response.data;
}

/**
 * Get details for a specific location
 */
export async function getLocation(id: string): Promise<LocationDetails> {
  const response = await apiClient.get<LocationDetails>(`/locations/${id}`);
  return response.data;
}
