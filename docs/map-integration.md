# Map Integration

## Overview

The map feature uses **Mapbox GL JS** via the `react-map-gl` library to provide an interactive map for discovering constitutional audit videos. This document covers the component architecture, data flow, and key patterns.

## Technology Stack

| Library | Purpose |
|---------|---------|
| `mapbox-gl` | Core map rendering engine |
| `react-map-gl` | React wrapper for Mapbox GL JS |
| `@mapbox/search-js-react` | Location search autocomplete |
| `@react-spring/web` | Animations (bottom sheet) |
| `@use-gesture/react` | Touch/drag gestures (bottom sheet) |

## Component Architecture

```
MapContainer (layout orchestrator)
├── MapView (react-map-gl wrapper)
│   ├── ClusterMarker[] (clustered location markers)
│   ├── VideoMarker[] (individual video markers)
│   └── VideoInfoCard (popup on marker click)
├── SidePanel (desktop: video list)
│   ├── FilterBar
│   │   ├── AmendmentFilter
│   │   └── ParticipantFilter
│   └── VideoListItem[]
├── BottomSheet (mobile: draggable video list)
│   ├── FilterBar
│   └── VideoListItem[]
├── LocationSearch (Mapbox Places autocomplete)
└── ToastContainer (notifications)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        MapProvider                               │
│  (viewport, bounds, filters, selectedVideoId, highlightedVideoId)│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MapContainer                               │
│                                                                  │
│  ┌──────────────────┐    ┌───────────────────┐                  │
│  │  useVideoSearch  │    │ useLocationClusters│                  │
│  │  (TanStack Query)│    │  (TanStack Query)  │                  │
│  └────────┬─────────┘    └─────────┬─────────┘                  │
│           │                        │                             │
│           ▼                        ▼                             │
│    Search Service           Location Service                     │
│    GET /search              GET /locations/cluster               │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### MapProvider (`src/providers/MapProvider.tsx`)

Central state management for the map feature:

```typescript
interface MapContextType {
  // Current map viewport (center + zoom)
  viewport: MapViewport;
  setViewport: (viewport: MapViewport) => void;

  // Bounding box of visible map area (for API queries)
  bounds: BoundingBox | null;
  setBounds: (bounds: BoundingBox | null) => void;

  // Video selection (click on marker or list item)
  selectedVideoId: string | null;
  setSelectedVideoId: (id: string | null) => void;

  // Video highlighting (hover on list item)
  highlightedVideoId: string | null;
  setHighlightedVideoId: (id: string | null) => void;

  // Active filters
  filters: MapFilters;
  setFilters: (filters: MapFilters) => void;
  updateFilters: (updates: Partial<MapFilters>) => void;
  clearFilters: () => void;

  // Programmatic map navigation
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
}
```

### MapView (`src/components/map/MapView.tsx`)

Wraps `react-map-gl` Map component:
- Syncs viewport state with MapProvider
- Updates bounds on map move (for querying visible area)
- Handles `flyTo` requests from MapProvider
- Renders children (markers, popups) as map overlays

### MapContainer (`src/components/map/MapContainer.tsx`)

Layout orchestrator that:
- Determines mobile vs desktop layout
- Fetches data via `useVideoSearch` and `useLocationClusters`
- Decides whether to show clusters or individual markers based on zoom
- Coordinates selection/highlighting between map and list

### VideoMarker (`src/components/map/VideoMarker.tsx`)

Individual video marker with:
- `data-video-id` attribute for E2E testing
- Visual states: default, selected (red), highlighted (amber)
- Click handler to select video and show popup

### ClusterMarker (`src/components/map/ClusterMarker.tsx`)

Cluster marker showing count of videos in area:
- Size scales with count (small < 10, medium < 100, large 100+)
- Click handler zooms to cluster's expansion zoom level

### VideoInfoCard (`src/components/map/VideoInfoCard.tsx`)

Popup displayed when a video is selected:
- Uses `react-map-gl` Popup component
- Shows video title, amendments, participant count
- "View Video" button links to `/videos/{id}`

## Hooks

### useVideoSearch (`src/hooks/useVideoSearch.ts`)

Fetches videos for the current map bounds and filters:

```typescript
const { data, isLoading, isError } = useVideoSearch({
  bounds,      // BoundingBox | null
  filters,     // MapFilters
  enabled,     // boolean (optional)
});
```

- Query key includes bounds and all filter fields
- Disabled when bounds is null
- 30-second stale time to reduce API calls during panning

### useLocationClusters (`src/hooks/useLocationClusters.ts`)

Fetches clustered locations for zoomed-out views:

```typescript
const { data } = useLocationClusters({
  bounds,  // BoundingBox | null
  zoom,    // number
  enabled, // boolean (optional)
});
```

- Only enabled when zoom < cluster threshold (8)
- Returns cluster positions and counts

## Configuration (`src/config/mapbox.ts`)

```typescript
// Mapbox access token (from environment)
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Map style
export const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v12";

// Default viewport (centered on USA)
export const DEFAULT_VIEWPORT = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 4,
};

// Behavior thresholds
export const MAP_CONFIG = {
  minZoom: 2,
  maxZoom: 18,
  clusterZoomThreshold: 8,  // Show clusters below this zoom
  maxVideosInPanel: 50,
  flyToDurationMs: 1500,
};
```

## Responsive Layout

### Desktop (width >= 768px)
- Fixed 350px side panel on left with video list
- Map fills remaining space
- Location search overlay in top-left of map

### Mobile (width < 768px)
- Full-screen map
- Draggable bottom sheet with video list
- Three snap points: collapsed (100px), half (50%), full (90%)
- Location search overlay at top

## Selection & Highlighting

| Action | Effect |
|--------|--------|
| Click marker | Sets `selectedVideoId`, shows popup, scrolls list to item |
| Click list item | Sets `selectedVideoId`, flies to location, shows popup |
| Hover list item | Sets `highlightedVideoId`, marker turns amber |
| Leave list item | Clears `highlightedVideoId` |
| Close popup | Clears `selectedVideoId` |

## API Response Transformation

The frontend transforms API responses to match internal types:

### Search Response
```typescript
// API returns:
{ results: [...], pagination: { page, size, totalElements } }

// Transformed to:
{ videos: VideoLocation[], total, page, pageSize }
```

### Cluster Response
```typescript
// API returns:
{ clusters: [{ coordinates: { latitude, longitude }, count }] }

// Transformed to:
{ clusters: [{ latitude, longitude, count }] }
```

## Filter Values

Filters use API-compatible values (uppercase enum names):

| Filter | Values |
|--------|--------|
| Amendments | `FIRST`, `SECOND`, `FOURTH`, `FIFTH`, `FOURTEENTH` |
| Participants | `POLICE`, `SECURITY`, `GOVERNMENT`, `BUSINESS`, `CIVILIAN` |

Display formatting converts these to user-friendly labels (e.g., `FIRST` → `1st`).

## Testing

Components include data attributes for E2E testing:
- `data-video-id` on markers and list items
- `data-cluster-id` on cluster markers
- `data-testid` for component identification

Unit tests in `src/__tests__/`:
- `components/map/VideoMarker.test.tsx`
- `components/map/AmendmentFilter.test.tsx`
- `components/map/ParticipantFilter.test.tsx`
- `hooks/useVideoSearch.test.tsx`
- `providers/MapProvider.test.tsx`
