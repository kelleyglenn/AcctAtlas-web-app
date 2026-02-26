import { render, screen, fireEvent } from "@testing-library/react";
import { MapContainer } from "@/components/map/MapContainer";

// Mock all child components as simple divs
jest.mock("@/components/map/MapView", () => ({
  MapView: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map-view">{children}</div>
  ),
}));
jest.mock("@/components/map/VideoMarker", () => ({
  VideoMarker: () => <div data-testid="video-marker" />,
}));
jest.mock("@/components/map/ClusterMarker", () => ({
  ClusterMarker: () => <div data-testid="cluster-marker" />,
}));
jest.mock("@/components/map/VideoInfoCard", () => ({
  VideoInfoCard: () => <div data-testid="video-info-card" />,
}));
jest.mock("@/components/map/SidePanel", () => ({
  SidePanel: () => <div data-testid="side-panel" />,
}));
jest.mock("@/components/map/BottomSheet", () => ({
  BottomSheet: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="bottom-sheet">{children}</div>
  ),
}));
jest.mock("@/components/map/LocationSearch", () => ({
  LocationSearch: () => <div data-testid="location-search" />,
}));
jest.mock("@/components/map/VideoListItem", () => ({
  VideoListItem: () => <div data-testid="video-list-item" />,
}));
jest.mock("@/components/map/FilterBar", () => ({
  FilterBar: () => <div data-testid="filter-bar" />,
}));
jest.mock("@/components/ui/Toast", () => ({
  useToasts: () => ({
    toasts: [],
    dismissToast: jest.fn(),
    success: jest.fn(),
  }),
  ToastContainer: () => null,
}));

const mockFlyTo = jest.fn();
const mockSetSelectedVideoId = jest.fn();
jest.mock("@/providers/MapProvider", () => ({
  useMap: () => ({
    bounds: [-130, 20, -60, 50],
    viewport: { longitude: -98.58, latitude: 39.83, zoom: 4 },
    filters: { amendments: [], participants: [] },
    selectedVideoId: null,
    setSelectedVideoId: mockSetSelectedVideoId,
    highlightedVideoId: null,
    setHighlightedVideoId: jest.fn(),
    flyTo: mockFlyTo,
    pendingFlyTo: null,
    clearPendingFlyTo: jest.fn(),
    fitBounds: jest.fn(),
    pendingFitBounds: null,
    clearPendingFitBounds: jest.fn(),
    setFilters: jest.fn(),
    updateFilters: jest.fn(),
    clearFilters: jest.fn(),
    setBounds: jest.fn(),
  }),
}));

jest.mock("@/hooks/useVideoSearch", () => ({
  useVideoSearch: () => ({ data: { videos: [], total: 0 }, isLoading: false }),
}));

jest.mock("@/hooks/useLocationClusters", () => ({
  useLocationClusters: () => ({ data: { clusters: [] } }),
}));

// For desktop rendering
let mockResponsive = { isMobile: false, isClient: true };
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));

jest.mock("@/config/mapbox", () => ({
  DEFAULT_VIEWPORT: { longitude: -98.5795, latitude: 39.8283, zoom: 4 },
  MAP_CONFIG: {
    minZoom: 2,
    maxZoom: 18,
    clusterZoomThreshold: 8,
    maxVideosInPanel: 50,
    moveDebounceMs: 300,
    flyToDurationMs: 1500,
    fitBoundsPadding: 50,
  },
  MAPBOX_ACCESS_TOKEN: "test-token",
  MAPBOX_STYLE: "mapbox://styles/mapbox/streets-v12",
  MARKER_COLORS: {
    default: "#3B82F6",
    selected: "#EF4444",
    highlighted: "#F59E0B",
    cluster: "#6366F1",
  },
  MARKER_SIZES: {
    default: 24,
    selected: 32,
    cluster: { small: 30, medium: 40, large: 50 },
  },
}));

describe("MapContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResponsive = { isMobile: false, isClient: true };
  });

  describe("home button", () => {
    it("renders reset map view button in desktop layout", () => {
      render(<MapContainer />);
      expect(screen.getByLabelText("Reset map view")).toBeInTheDocument();
    });

    it("renders reset map view button in mobile layout", () => {
      mockResponsive = { isMobile: true, isClient: true };
      render(<MapContainer />);
      expect(screen.getByLabelText("Reset map view")).toBeInTheDocument();
    });

    it("calls flyTo with default viewport and clears selection on click", () => {
      render(<MapContainer />);
      fireEvent.click(screen.getByLabelText("Reset map view"));
      expect(mockFlyTo).toHaveBeenCalledWith(-98.5795, 39.8283, 4);
      expect(mockSetSelectedVideoId).toHaveBeenCalledWith(null);
    });
  });

  describe("loading state", () => {
    it("shows loading placeholder when isClient is false", () => {
      mockResponsive = { isMobile: false, isClient: false };
      render(<MapContainer />);
      expect(screen.getByText("Loading map...")).toBeInTheDocument();
    });
  });

  describe("search bar translucency", () => {
    it("search bar wrapper has opacity-60 class in desktop layout", () => {
      render(<MapContainer />);
      const resetButton = screen.getByLabelText("Reset map view");
      const wrapper = resetButton.closest("[class*='opacity-60']");
      expect(wrapper).not.toBeNull();
      expect(wrapper?.className).toContain("hover:opacity-100");
      expect(wrapper?.className).toContain("focus-within:opacity-100");
      expect(wrapper?.className).toContain("transition-opacity");
    });
  });
});
