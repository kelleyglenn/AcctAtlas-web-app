"use client";

import { Marker } from "react-map-gl/mapbox";
import { useMap } from "@/providers/MapProvider";
import { MARKER_COLORS, MARKER_SIZES, MAP_CONFIG } from "@/config/mapbox";
import type { LocationCluster } from "@/types/map";

interface ClusterMarkerProps {
  cluster: LocationCluster;
  onClick?: (cluster: LocationCluster) => void;
}

export function ClusterMarker({ cluster, onClick }: ClusterMarkerProps) {
  const { setViewport, viewport } = useMap();

  // Determine size based on count
  const getSize = () => {
    if (cluster.count < 10) return MARKER_SIZES.cluster.small;
    if (cluster.count < 100) return MARKER_SIZES.cluster.medium;
    return MARKER_SIZES.cluster.large;
  };

  const size = getSize();

  const handleClick = () => {
    // Zoom in to expansion zoom or one level up
    const newZoom = cluster.expansion_zoom ?? Math.min(viewport.zoom + 2, MAP_CONFIG.maxZoom);
    setViewport({
      longitude: cluster.longitude,
      latitude: cluster.latitude,
      zoom: newZoom,
    });
    onClick?.(cluster);
  };

  // Format count for display
  const displayCount = cluster.count >= 1000
    ? `${Math.floor(cluster.count / 1000)}k+`
    : cluster.count.toString();

  return (
    <Marker
      longitude={cluster.longitude}
      latitude={cluster.latitude}
      anchor="center"
    >
      <div
        data-cluster-id={cluster.id}
        data-testid="cluster-marker"
        className="cursor-pointer transition-transform hover:scale-110"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Cluster of ${cluster.count} videos`}
      >
        <div
          className="flex items-center justify-center rounded-full text-white font-semibold text-sm shadow-lg"
          style={{
            width: size,
            height: size,
            backgroundColor: MARKER_COLORS.cluster,
            border: "3px solid white",
          }}
        >
          {displayCount}
        </div>
      </div>
    </Marker>
  );
}
