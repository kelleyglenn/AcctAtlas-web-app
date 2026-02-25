import { useQuery } from "@tanstack/react-query";
import { searchClusters } from "@/lib/api/search";
import type { BoundingBox, ClusterResponse, MapFilters } from "@/types/map";
import { MAP_CONFIG } from "@/config/mapbox";

interface UseLocationClustersOptions {
  bounds: BoundingBox | null;
  zoom: number;
  filters?: MapFilters;
  enabled?: boolean;
}

export function useLocationClusters({
  bounds,
  zoom,
  filters,
  enabled = true,
}: UseLocationClustersOptions) {
  // Only use clustering when zoom is below the threshold
  const shouldCluster = zoom < MAP_CONFIG.clusterZoomThreshold;

  return useQuery<ClusterResponse>({
    queryKey: [
      "search",
      "clusters",
      bounds,
      Math.floor(zoom),
      filters?.amendments,
      filters?.participants,
    ],
    queryFn: () =>
      searchClusters({
        bbox: bounds!,
        zoom: Math.floor(zoom),
        amendments: filters?.amendments,
        participants: filters?.participants,
      }),
    enabled: enabled && !!bounds && shouldCluster,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  });
}
