import axios from "axios";
import { apiClient } from "./client";
import type { SearchParams, SearchResponse } from "@/types/map";

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
    const response = await apiClient.get<SearchResponse>("/search", {
      params: filteredParams,
    });
    return response.data;
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
