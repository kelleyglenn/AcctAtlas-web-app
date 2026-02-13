import { apiClient } from "./client";
import type {
  ClusterParams,
  ClusterResponse,
  LocationCluster,
  LocationDetails,
} from "@/types/map";

/**
 * Raw API response structure from location service cluster endpoint
 */
interface ApiCluster {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  count: number;
  sampleVideoIds?: string[];
}

interface ApiClusterResponse {
  clusters: ApiCluster[];
  totalLocations: number;
  zoom: number;
}

/**
 * Transform API cluster response to frontend format
 */
function transformClusterResponse(apiResponse: ApiClusterResponse): ClusterResponse {
  const clusters: LocationCluster[] = apiResponse.clusters.map((cluster) => ({
    id: cluster.id,
    latitude: cluster.coordinates.latitude,
    longitude: cluster.coordinates.longitude,
    count: cluster.count,
    videoIds: cluster.sampleVideoIds,
  }));

  return {
    clusters,
    zoom: apiResponse.zoom,
  };
}

/**
 * Get clustered locations for a bounding box and zoom level
 */
export async function getClusters(
  params: ClusterParams
): Promise<ClusterResponse> {
  const response = await apiClient.get<ApiClusterResponse>("/locations/cluster", {
    params: {
      bbox: params.bbox.join(","),
      zoom: params.zoom,
    },
  });
  return transformClusterResponse(response.data);
}

/**
 * Get details for a specific location
 */
export async function getLocation(id: string): Promise<LocationDetails> {
  const response = await apiClient.get<LocationDetails>(`/locations/${id}`);
  return response.data;
}
