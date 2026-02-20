import { render, screen, fireEvent } from "@testing-library/react";
import { VideoMarker } from "@/components/map/VideoMarker";
import { MapProvider } from "@/providers/MapProvider";
import type { VideoLocation } from "@/types/map";

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

const renderWithProvider = (component: React.ReactNode) => {
  return render(<MapProvider>{component}</MapProvider>);
};

const validVideo: VideoLocation = {
  id: "loc-1",
  videoId: "video-1",
  latitude: 37.5,
  longitude: -122.5,
  title: "Test Video",
  amendments: ["1", "4"],
};

describe("VideoMarker", () => {
  describe("coordinate validation", () => {
    it("should render marker for valid coordinates", () => {
      renderWithProvider(<VideoMarker video={validVideo} />);

      expect(screen.getByTestId("video-marker")).toBeInTheDocument();
    });

    it("should not render for NaN latitude", () => {
      const invalidVideo = { ...validVideo, latitude: NaN };
      const { container } = renderWithProvider(
        <VideoMarker video={invalidVideo} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render for NaN longitude", () => {
      const invalidVideo = { ...validVideo, longitude: NaN };
      const { container } = renderWithProvider(
        <VideoMarker video={invalidVideo} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render for undefined latitude", () => {
      const invalidVideo = {
        ...validVideo,
        latitude: undefined as unknown as number,
      };
      const { container } = renderWithProvider(
        <VideoMarker video={invalidVideo} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render for undefined longitude", () => {
      const invalidVideo = {
        ...validVideo,
        longitude: undefined as unknown as number,
      };
      const { container } = renderWithProvider(
        <VideoMarker video={invalidVideo} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render for string latitude", () => {
      const invalidVideo = {
        ...validVideo,
        latitude: "37.5" as unknown as number,
      };
      const { container } = renderWithProvider(
        <VideoMarker video={invalidVideo} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("marker rendering", () => {
    it("should render with data-video-id attribute", () => {
      renderWithProvider(<VideoMarker video={validVideo} />);

      const marker = screen.getByTestId("video-marker");
      expect(marker).toHaveAttribute("data-video-id", "loc-1");
    });

    it("should have accessible aria-label", () => {
      renderWithProvider(<VideoMarker video={validVideo} />);

      const marker = screen.getByRole("button");
      expect(marker).toHaveAttribute("aria-label", "Video: Test Video");
    });

    it("should be keyboard accessible with tabIndex", () => {
      renderWithProvider(<VideoMarker video={validVideo} />);

      const marker = screen.getByRole("button");
      expect(marker).toHaveAttribute("tabindex", "0");
    });
  });

  describe("click handling", () => {
    it("should call onClick when clicked", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <VideoMarker video={validVideo} onClick={handleClick} />
      );

      fireEvent.click(screen.getByRole("button"));

      expect(handleClick).toHaveBeenCalledWith(validVideo);
    });

    it("should call onClick on Enter key", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <VideoMarker video={validVideo} onClick={handleClick} />
      );

      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });

      expect(handleClick).toHaveBeenCalledWith(validVideo);
    });

    it("should call onClick on Space key", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <VideoMarker video={validVideo} onClick={handleClick} />
      );

      fireEvent.keyDown(screen.getByRole("button"), { key: " " });

      expect(handleClick).toHaveBeenCalledWith(validVideo);
    });

    it("should stop click event propagation", () => {
      renderWithProvider(<VideoMarker video={validVideo} />);

      const marker = screen.getByRole("button");
      const clickEvent = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(clickEvent, "stopPropagation", {
        value: jest.fn(),
      });
      marker.dispatchEvent(clickEvent);

      expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });
  });
});
