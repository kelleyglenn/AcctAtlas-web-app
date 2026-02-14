import type { MapViewport } from "@/types/map";

// Mapbox access token from environment
export const MAPBOX_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Default map style
export const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";

// Default viewport centered on the USA
export const DEFAULT_VIEWPORT: MapViewport = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4,
};

// Map constraints
export const MAP_CONFIG = {
  minZoom: 2,
  maxZoom: 18,
  // Zoom threshold for showing individual markers vs clusters
  // Lower value = show markers sooner (clusters only at very zoomed out levels)
  clusterZoomThreshold: 8,
  // Max videos to show in side panel
  maxVideosInPanel: 50,
  // Debounce delay for map moves (ms)
  moveDebounceMs: 300,
  // Animation duration for fly-to (ms)
  flyToDurationMs: 1500,
  // Padding (px) for fitBounds when zooming into clusters
  fitBoundsPadding: 50,
};

// Marker colors
export const MARKER_COLORS = {
  default: "#3B82F6", // blue-500
  selected: "#EF4444", // red-500
  highlighted: "#F59E0B", // amber-500
  cluster: "#6366F1", // indigo-500
};

// Marker sizes
export const MARKER_SIZES = {
  default: 24,
  selected: 32,
  cluster: {
    small: 30, // < 10
    medium: 40, // 10-99
    large: 50, // 100+
  },
};
