import { render, screen, fireEvent, act } from "@testing-library/react";
import { ClusterMarker } from "@/components/map/ClusterMarker";
import { MapProvider, useMap } from "@/providers/MapProvider";
import type { LocationCluster } from "@/types/map";

// Mock react-map-gl/mapbox
jest.mock("react-map-gl/mapbox", () => ({
  Marker: ({
    children,
    longitude,
    latitude,
  }: {
    children: React.ReactNode;
    longitude: number;
    latitude: number;
  }) => (
    <div data-testid="marker" data-lng={longitude} data-lat={latitude}>
      {children}
    </div>
  ),
}));

// Helper component to read MapProvider state
let mapState: ReturnType<typeof useMap>;
function MapStateReader() {
  mapState = useMap();
  return null;
}

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <MapProvider>
      <MapStateReader />
      {component}
    </MapProvider>
  );
};

const validCluster: LocationCluster = {
  id: "cluster-1",
  latitude: 37.5,
  longitude: -122.5,
  count: 5,
};

describe("ClusterMarker", () => {
  describe("coordinate validation", () => {
    it("should return null for NaN latitude", () => {
      const cluster = { ...validCluster, latitude: NaN };
      const { container } = renderWithProvider(
        <ClusterMarker cluster={cluster} />
      );

      expect(
        container.querySelector("[data-testid='cluster-marker']")
      ).toBeNull();
    });

    it("should return null for NaN longitude", () => {
      const cluster = { ...validCluster, longitude: NaN };
      const { container } = renderWithProvider(
        <ClusterMarker cluster={cluster} />
      );

      expect(
        container.querySelector("[data-testid='cluster-marker']")
      ).toBeNull();
    });

    it("should return null for non-number latitude", () => {
      const cluster = {
        ...validCluster,
        latitude: "37.5" as unknown as number,
      };
      const { container } = renderWithProvider(
        <ClusterMarker cluster={cluster} />
      );

      expect(
        container.querySelector("[data-testid='cluster-marker']")
      ).toBeNull();
    });

    it("should return null for non-number longitude", () => {
      const cluster = {
        ...validCluster,
        longitude: undefined as unknown as number,
      };
      const { container } = renderWithProvider(
        <ClusterMarker cluster={cluster} />
      );

      expect(
        container.querySelector("[data-testid='cluster-marker']")
      ).toBeNull();
    });

    it("should render for valid coordinates", () => {
      renderWithProvider(<ClusterMarker cluster={validCluster} />);

      expect(screen.getByTestId("cluster-marker")).toBeInTheDocument();
    });
  });

  describe("marker sizing", () => {
    it("should use small size for count < 10", () => {
      const cluster = { ...validCluster, count: 5 };
      renderWithProvider(<ClusterMarker cluster={cluster} />);

      const inner = screen.getByText("5");
      expect(inner).toHaveStyle({ width: "30px", height: "30px" });
    });

    it("should use medium size for 10 <= count < 100", () => {
      const cluster = { ...validCluster, count: 42 };
      renderWithProvider(<ClusterMarker cluster={cluster} />);

      const inner = screen.getByText("42");
      expect(inner).toHaveStyle({ width: "40px", height: "40px" });
    });

    it("should use large size for count >= 100", () => {
      const cluster = { ...validCluster, count: 150 };
      renderWithProvider(<ClusterMarker cluster={cluster} />);

      const inner = screen.getByText("150");
      expect(inner).toHaveStyle({ width: "50px", height: "50px" });
    });
  });

  describe("display count formatting", () => {
    it("should display raw count for count < 1000", () => {
      const cluster = { ...validCluster, count: 5 };
      renderWithProvider(<ClusterMarker cluster={cluster} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should display '1k+' for count = 1000", () => {
      const cluster = { ...validCluster, count: 1000 };
      renderWithProvider(<ClusterMarker cluster={cluster} />);

      expect(screen.getByText("1k+")).toBeInTheDocument();
    });

    it("should display '2k+' for count = 2500", () => {
      const cluster = { ...validCluster, count: 2500 };
      renderWithProvider(<ClusterMarker cluster={cluster} />);

      expect(screen.getByText("2k+")).toBeInTheDocument();
    });
  });

  describe("click handling", () => {
    it("should call setViewport with expansion_zoom when provided", () => {
      const cluster = { ...validCluster, expansion_zoom: 10 };
      renderWithProvider(<ClusterMarker cluster={cluster} />);

      act(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(mapState.viewport).toEqual({
        longitude: cluster.longitude,
        latitude: cluster.latitude,
        zoom: 10,
      });
    });

    it("should call setViewport with current zoom + 2 when no expansion_zoom", () => {
      renderWithProvider(<ClusterMarker cluster={validCluster} />);

      // Default viewport zoom is 4, so new zoom should be 6
      act(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(mapState.viewport).toEqual({
        longitude: validCluster.longitude,
        latitude: validCluster.latitude,
        zoom: 6,
      });
    });

    it("should cap zoom at maxZoom (18)", () => {
      renderWithProvider(<ClusterMarker cluster={validCluster} />);

      // Set viewport to zoom 17 first, then click should cap at 18
      act(() => {
        mapState.setViewport({
          longitude: 0,
          latitude: 0,
          zoom: 17,
        });
      });

      act(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(mapState.viewport.zoom).toBe(18);
    });

    it("should call onClick callback when provided", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <ClusterMarker cluster={validCluster} onClick={handleClick} />
      );

      act(() => {
        fireEvent.click(screen.getByRole("button"));
      });

      expect(handleClick).toHaveBeenCalledWith(validCluster);
    });
  });

  describe("keyboard interaction", () => {
    it("should trigger handleClick on Enter key", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <ClusterMarker cluster={validCluster} onClick={handleClick} />
      );

      act(() => {
        fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      });

      expect(handleClick).toHaveBeenCalledWith(validCluster);
    });

    it("should trigger handleClick on Space key", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <ClusterMarker cluster={validCluster} onClick={handleClick} />
      );

      act(() => {
        fireEvent.keyDown(screen.getByRole("button"), { key: " " });
      });

      expect(handleClick).toHaveBeenCalledWith(validCluster);
    });
  });

  describe("accessibility", () => {
    it("should have correct aria-label", () => {
      renderWithProvider(<ClusterMarker cluster={validCluster} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "aria-label",
        `Cluster of ${validCluster.count} videos`
      );
    });

    it("should be keyboard focusable with tabIndex", () => {
      renderWithProvider(<ClusterMarker cluster={validCluster} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("tabindex", "0");
    });
  });
});
