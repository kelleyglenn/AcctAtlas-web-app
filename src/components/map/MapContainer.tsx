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
import { DEFAULT_VIEWPORT, MAP_CONFIG } from "@/config/mapbox";
import type { VideoLocation } from "@/types/map";

export function MapContainer() {
  const {
    bounds,
    viewport,
    filters,
    selectedVideoId,
    setViewport,
    setSelectedVideoId,
  } = useMap();
  const { isMobile, isClient } = useResponsive();
  const { toasts, dismissToast, success } = useToasts();

  // Fetch videos for current bounds
  const { data: searchData, isLoading: isSearchLoading } = useVideoSearch({
    bounds,
    filters,
  });

  // Fetch clusters when zoomed out
  const { data: clusterData } = useLocationClusters({
    bounds,
    zoom: viewport.zoom,
    filters,
  });

  // Determine whether to show clusters or individual markers
  const showClusters = viewport.zoom < MAP_CONFIG.clusterZoomThreshold;

  // Filter videos with valid coordinates
  const validVideos = useMemo(() => {
    if (!searchData?.videos) return [];
    return searchData.videos.filter(
      (video) =>
        typeof video.latitude === "number" &&
        typeof video.longitude === "number" &&
        !isNaN(video.latitude) &&
        !isNaN(video.longitude) &&
        video.latitude >= -90 &&
        video.latitude <= 90 &&
        video.longitude >= -180 &&
        video.longitude <= 180
    );
  }, [searchData?.videos]);

  // Filter clusters with valid coordinates
  const validClusters = useMemo(() => {
    if (!clusterData?.clusters) return [];
    return clusterData.clusters.filter(
      (cluster) =>
        typeof cluster.latitude === "number" &&
        typeof cluster.longitude === "number" &&
        !isNaN(cluster.latitude) &&
        !isNaN(cluster.longitude)
    );
  }, [clusterData?.clusters]);

  // Find selected video for info card
  const selectedVideo = useMemo<VideoLocation | null>(() => {
    if (!selectedVideoId || !validVideos.length) return null;
    return validVideos.find((v) => v.id === selectedVideoId) ?? null;
  }, [selectedVideoId, validVideos]);

  const handleLocationSelect = (name: string) => {
    success(`Moved to ${name}`);
  };

  // Don't render until we know if we're on mobile
  if (!isClient) {
    return (
      <div className="h-[calc(100vh-3.5rem)] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-3.5rem)] relative">
        {/* Map takes full screen */}
        <MapView>
          {/* Clusters when zoomed out */}
          {showClusters &&
            validClusters.map((cluster) => (
              <ClusterMarker key={cluster.id} cluster={cluster} />
            ))}

          {/* Individual markers when zoomed in */}
          {!showClusters &&
            validVideos.map((video) => (
              <VideoMarker key={video.id} video={video} />
            ))}

          {/* Always show selected video marker, even in cluster mode */}
          {showClusters && selectedVideo && (
            <VideoMarker
              key={`selected-${selectedVideo.id}`}
              video={selectedVideo}
            />
          )}

          {/* Info card popup */}
          {selectedVideo && <VideoInfoCard video={selectedVideo} />}
        </MapView>

        {/* Search bar overlay */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-start gap-2 opacity-60 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <div className="flex-1">
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </div>
          <button
            onClick={() => {
              setViewport(DEFAULT_VIEWPORT);
              setSelectedVideoId(null);
            }}
            className="flex-shrink-0 w-9 h-9 bg-white rounded-md shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            aria-label="Reset map view"
            title="Reset map view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>
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
            ) : validVideos.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No videos in this area</p>
              </div>
            ) : (
              validVideos.map((video) => (
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
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Side panel - fixed 350px width */}
      <div className="w-[350px] flex-shrink-0">
        <SidePanel
          videos={validVideos}
          isLoading={isSearchLoading}
          totalCount={searchData?.total}
        />
      </div>

      {/* Map - fills remaining space */}
      <div className="flex-1 relative">
        <MapView>
          {/* Clusters when zoomed out */}
          {showClusters &&
            validClusters.map((cluster) => (
              <ClusterMarker key={cluster.id} cluster={cluster} />
            ))}

          {/* Individual markers when zoomed in */}
          {!showClusters &&
            validVideos.map((video) => (
              <VideoMarker key={video.id} video={video} />
            ))}

          {/* Always show selected video marker, even in cluster mode */}
          {showClusters && selectedVideo && (
            <VideoMarker
              key={`selected-${selectedVideo.id}`}
              video={selectedVideo}
            />
          )}

          {/* Info card popup */}
          {selectedVideo && <VideoInfoCard video={selectedVideo} />}
        </MapView>

        {/* Search bar overlay */}
        <div className="absolute top-4 left-4 right-4 max-w-md z-10 flex items-start gap-2 opacity-60 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <div className="flex-1">
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </div>
          <button
            onClick={() => {
              setViewport(DEFAULT_VIEWPORT);
              setSelectedVideoId(null);
            }}
            className="flex-shrink-0 w-9 h-9 bg-white rounded-md shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            aria-label="Reset map view"
            title="Reset map view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
