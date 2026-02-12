import { apiClient } from "./client";
import type { SearchParams, SearchResponse } from "@/types/map";

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

  const response = await apiClient.get<SearchResponse>("/search", {
    params: filteredParams,
  });
  return response.data;
}
