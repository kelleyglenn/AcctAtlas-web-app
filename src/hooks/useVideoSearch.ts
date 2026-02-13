import { useQuery } from "@tanstack/react-query";
import { searchVideos } from "@/lib/api/search";
import type { BoundingBox, MapFilters, SearchResponse } from "@/types/map";
import { MAP_CONFIG } from "@/config/mapbox";

interface UseVideoSearchOptions {
  bounds: BoundingBox | null;
  filters: MapFilters;
  enabled?: boolean;
}

export function useVideoSearch({
  bounds,
  filters,
  enabled = true,
}: UseVideoSearchOptions) {
  return useQuery<SearchResponse>({
    // Include all filter fields explicitly to prevent refetches when object reference changes
    queryKey: [
      "search",
      "videos",
      bounds,
      filters.amendments,
      filters.participants,
      filters.dateFrom,
      filters.dateTo,
    ],
    queryFn: () =>
      searchVideos({
        bbox: bounds ?? undefined,
        amendments: filters.amendments,
        participants: filters.participants,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        pageSize: MAP_CONFIG.maxVideosInPanel,
      }),
    enabled: enabled && !!bounds,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute (garbage collection time, formerly cacheTime)
  });
}
