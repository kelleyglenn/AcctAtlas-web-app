"use client";

import { useMemo } from "react";
import { useMap } from "@/providers/MapProvider";
import { useVideoSearch } from "@/hooks/useVideoSearch";
import { useLocationClusters } from "@/hooks/useLocationClusters";
import { useResponsive } from "@/hooks/useResponsive";
import { useToasts, ToastContainer } from "@/components/ui/Toast";
import { MapView } from "./MapView";
import { VideoMarker } from "./VideoMarker";
import { ClusterMarker } from "./ClusterMarker";
import { VideoInfoCard } from "./VideoInfoCard";
import { SidePanel } from "./SidePanel";
import { BottomSheet } from "./BottomSheet";
import { LocationSearch } from "./LocationSearch";
import { VideoListItem } from "./VideoListItem";
import { FilterBar } from "./FilterBar";
import { MAP_CONFIG } from "@/config/mapbox";
import type { VideoLocation } from "@/types/map";

export function MapContainer() {
  const { bounds, viewport, filters, selectedVideoId } = useMap();
  const { isMobile, isClient } = useResponsive();
  const { toasts, dismissToast, success } = useToasts();

  // Fetch videos for current bounds
  const {
    data: searchData,
    isLoading: isSearchLoading,
  } = useVideoSearch({
    bounds,
    filters,
  });

  // Fetch clusters when zoomed out
  const { data: clusterData } = useLocationClusters({
    bounds,
    zoom: viewport.zoom,
  });

  // Determine whether to show clusters or individual markers
  const showClusters = viewport.zoom < MAP_CONFIG.clusterZoomThreshold;

  // Find selected video for info card
  const selectedVideo = useMemo<VideoLocation | null>(() => {
    if (!selectedVideoId || !searchData?.videos) return null;
    return searchData.videos.find((v) => v.id === selectedVideoId) ?? null;
  }, [selectedVideoId, searchData?.videos]);

  const handleLocationSelect = (name: string) => {
    success(`Moved to ${name}`);
  };

  // Don't render until we know if we're on mobile
  if (!isClient) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-screen relative">
        {/* Map takes full screen */}
        <MapView>
          {/* Clusters */}
          {showClusters &&
            clusterData?.clusters.map((cluster) => (
              <ClusterMarker key={cluster.id} cluster={cluster} />
            ))}

          {/* Individual markers */}
          {!showClusters &&
            searchData?.videos.map((video) => (
              <VideoMarker key={video.id} video={video} />
            ))}

          {/* Info card popup */}
          {selectedVideo && <VideoInfoCard video={selectedVideo} />}
        </MapView>

        {/* Search bar overlay */}
        <div className="absolute top-4 left-4 right-4 z-30">
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>

        {/* Bottom sheet with video list */}
        <BottomSheet
          title="Videos"
          subtitle={
            searchData?.total !== undefined
              ? `${searchData.total.toLocaleString()} videos`
              : undefined
          }
        >
          <FilterBar />
          <div>
            {isSearchLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-24 h-16 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchData?.videos.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No videos in this area</p>
              </div>
            ) : (
              searchData?.videos.map((video) => (
                <VideoListItem key={video.id} video={video} />
              ))
            )}
          </div>
        </BottomSheet>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex">
      {/* Side panel - fixed 350px width */}
      <div className="w-[350px] flex-shrink-0">
        <SidePanel
          videos={searchData?.videos ?? []}
          isLoading={isSearchLoading}
          totalCount={searchData?.total}
        />
      </div>

      {/* Map - fills remaining space */}
      <div className="flex-1 relative">
        <MapView>
          {/* Clusters */}
          {showClusters &&
            clusterData?.clusters.map((cluster) => (
              <ClusterMarker key={cluster.id} cluster={cluster} />
            ))}

          {/* Individual markers */}
          {!showClusters &&
            searchData?.videos.map((video) => (
              <VideoMarker key={video.id} video={video} />
            ))}

          {/* Info card popup */}
          {selectedVideo && <VideoInfoCard video={selectedVideo} />}
        </MapView>

        {/* Search bar overlay */}
        <div className="absolute top-4 left-4 right-4 max-w-md z-10">
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
