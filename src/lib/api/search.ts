import axios from "axios";
import { apiClient } from "./client";
import type {
  ClusterParams,
  ClusterResponse,
  LocationCluster,
  SearchParams,
  SearchResponse,
  VideoLocation,
} from "@/types/map";

/**
 * Search API error with additional context
 */
export class SearchError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "SearchError";
  }
}

/**
 * Raw API response structure from search service
 */
interface ApiSearchResult {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  channelName?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  videoDate?: string;
  amendments: string[];
  participants: string[];
  locations: Array<{
    id: string;
    displayName: string;
    city?: string;
    state?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
}

interface ApiSearchResponse {
  results: ApiSearchResult[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * Transform API response to frontend format
 */
function transformSearchResponse(
  apiResponse: ApiSearchResponse
): SearchResponse {
  const videos: VideoLocation[] = apiResponse.results
    .filter((result) => result.locations && result.locations.length > 0)
    .map((result) => {
      const primaryLocation = result.locations[0];
      return {
        id: primaryLocation.id,
        videoId: result.id,
        latitude: primaryLocation.coordinates.latitude,
        longitude: primaryLocation.coordinates.longitude,
        title: result.title,
        thumbnailUrl: result.thumbnailUrl,
        duration: result.durationSeconds,
        recordedAt: result.videoDate,
        amendments: result.amendments,
        participantCount: result.participants.length,
        participants: result.participants,
      };
    });

  return {
    videos,
    total: apiResponse.pagination.totalElements,
    page: apiResponse.pagination.page,
    pageSize: apiResponse.pagination.size,
  };
}

/**
 * Search for videos within a bounding box with optional filters
 */
export async function searchVideos(
  params: SearchParams
): Promise<SearchResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    pageSize: params.pageSize,
    query: params.query,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  // Add bbox as comma-separated string if provided
  if (params.bbox) {
    queryParams.bbox = params.bbox.join(",");
  }

  // Add amendments as comma-separated string if provided
  if (params.amendments && params.amendments.length > 0) {
    queryParams.amendments = params.amendments.join(",");
  }

  // Add participants as comma-separated string if provided
  if (params.participants && params.participants.length > 0) {
    queryParams.participants = params.participants.join(",");
  }

  // Filter out undefined values
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(([, v]) => v !== undefined)
  );

  try {
    const response = await apiClient.get<ApiSearchResponse>("/search", {
      params: filteredParams,
    });
    return transformSearchResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to search videos";
      throw new SearchError(message, statusCode, error);
    }
    throw new SearchError("An unexpected error occurred", undefined, error);
  }
}

/**
 * Raw API response structure from search service cluster endpoint
 */
interface ApiCluster {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  count: number;
  bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

interface ApiClusterResponse {
  clusters: ApiCluster[];
  totalLocations: number;
  zoom: number;
}

/**
 * Transform API cluster response to frontend format
 */
function transformClusterResponse(
  apiResponse: ApiClusterResponse
): ClusterResponse {
  const clusters: LocationCluster[] = apiResponse.clusters.map((cluster) => ({
    id: cluster.id,
    latitude: cluster.coordinates.latitude,
    longitude: cluster.coordinates.longitude,
    count: cluster.count,
    bounds: cluster.bounds,
  }));

  return {
    clusters,
    zoom: apiResponse.zoom,
  };
}

/**
 * Get clustered video counts for a bounding box with optional filters
 */
export async function searchClusters(
  params: ClusterParams
): Promise<ClusterResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    bbox: params.bbox.join(","),
    zoom: params.zoom,
  };

  if (params.amendments && params.amendments.length > 0) {
    queryParams.amendments = params.amendments.join(",");
  }

  if (params.participants && params.participants.length > 0) {
    queryParams.participants = params.participants.join(",");
  }

  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(([, v]) => v !== undefined)
  );

  try {
    const response = await apiClient.get<ApiClusterResponse>(
      "/search/cluster",
      {
        params: filteredParams,
      }
    );
    return transformClusterResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch clusters";
      throw new SearchError(message, statusCode, error);
    }
    throw new SearchError("An unexpected error occurred", undefined, error);
  }
}
