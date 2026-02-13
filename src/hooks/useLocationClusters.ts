import { useQuery } from "@tanstack/react-query";
import { getClusters } from "@/lib/api/locations";
import type { BoundingBox, ClusterResponse } from "@/types/map";
import { MAP_CONFIG } from "@/config/mapbox";

interface UseLocationClustersOptions {
  bounds: BoundingBox | null;
  zoom: number;
  enabled?: boolean;
}

export function useLocationClusters({
  bounds,
  zoom,
  enabled = true,
}: UseLocationClustersOptions) {
  // Only use clustering when zoom is below the threshold
  const shouldCluster = zoom < MAP_CONFIG.clusterZoomThreshold;

  return useQuery<ClusterResponse>({
    queryKey: ["locations", "clusters", bounds, Math.floor(zoom)],
    queryFn: () =>
      getClusters({
        bbox: bounds!,
        zoom: Math.floor(zoom),
      }),
    enabled: enabled && !!bounds && shouldCluster,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  });
}
