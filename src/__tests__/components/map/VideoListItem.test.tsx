import { render, screen, fireEvent, act } from "@testing-library/react";
import { VideoListItem } from "@/components/map/VideoListItem";
import { MapProvider, useMap } from "@/providers/MapProvider";
import type { VideoLocation } from "@/types/map";

// Mock react-map-gl/mapbox (needed by MapProvider transitively)
jest.mock("react-map-gl/mapbox", () => ({
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
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

const baseVideo: VideoLocation = {
  id: "loc-1",
  videoId: "video-1",
  latitude: 37.5,
  longitude: -122.5,
  title: "Test Video Title",
  amendments: [],
};

describe("VideoListItem", () => {
  describe("rendering", () => {
    it("should render video title", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    });

    it("should render thumbnail when thumbnailUrl is provided", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://example.com/thumb.jpg",
      };
      renderWithProvider(<VideoListItem video={video} />);

      // img has alt="" which gives it role="presentation", so use querySelector
      const img = screen.getByTestId("video-list-item").querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/thumb.jpg");
    });

    it("should show placeholder when no thumbnailUrl", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      // No <img> element should exist
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      // Placeholder SVG is rendered inside a div
      const listItem = screen.getByTestId("video-list-item");
      const svg = listItem.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should have data-video-id attribute", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      const listItem = screen.getByTestId("video-list-item");
      expect(listItem).toHaveAttribute("data-video-id", "loc-1");
    });
  });

  describe("amendments", () => {
    it("should show amendment badges with formatted labels", () => {
      const video = { ...baseVideo, amendments: ["FIRST", "FOURTH"] };
      renderWithProvider(<VideoListItem video={video} />);

      expect(screen.getByText("1st")).toBeInTheDocument();
      expect(screen.getByText("4th")).toBeInTheDocument();
    });

    it("should not show amendment section when no amendments", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      expect(screen.queryByText("1st")).not.toBeInTheDocument();
    });
  });

  describe("participant count", () => {
    it("should show singular 'participant' for count of 1", () => {
      const video = { ...baseVideo, participantCount: 1 };
      renderWithProvider(<VideoListItem video={video} />);

      expect(screen.getByText("1 participant")).toBeInTheDocument();
    });

    it("should show plural 'participants' for count > 1", () => {
      const video = { ...baseVideo, participantCount: 3 };
      renderWithProvider(<VideoListItem video={video} />);

      expect(screen.getByText("3 participants")).toBeInTheDocument();
    });

    it("should not show participant count when not provided", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      expect(screen.queryByText(/participant/)).not.toBeInTheDocument();
    });
  });

  describe("date", () => {
    it("should show formatted date when recordedAt is provided", () => {
      const video = { ...baseVideo, recordedAt: "2024-06-15T10:30:00Z" };
      renderWithProvider(<VideoListItem video={video} />);

      // toLocaleDateString with en-US, month: short, day: numeric, year: numeric
      expect(screen.getByText("Jun 15, 2024")).toBeInTheDocument();
    });

    it("should not show date when recordedAt is not provided", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      expect(screen.queryByText(/2024/)).not.toBeInTheDocument();
    });
  });

  describe("duration", () => {
    it("should show duration in mm:ss format", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://example.com/thumb.jpg",
        duration: 125,
      };
      renderWithProvider(<VideoListItem video={video} />);

      expect(screen.getByText("2:05")).toBeInTheDocument();
    });

    it("should show 0:30 for 30 seconds", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://example.com/thumb.jpg",
        duration: 30,
      };
      renderWithProvider(<VideoListItem video={video} />);

      expect(screen.getByText("0:30")).toBeInTheDocument();
    });

    it("should not show duration when not provided", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://example.com/thumb.jpg",
      };
      renderWithProvider(<VideoListItem video={video} />);

      expect(screen.queryByText(/\d+:\d+/)).not.toBeInTheDocument();
    });
  });

  describe("click handling", () => {
    it("should set selectedVideoId and trigger flyTo on click", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      act(() => {
        fireEvent.click(screen.getByTestId("video-list-item"));
      });

      expect(mapState.selectedVideoId).toBe("loc-1");
      expect(mapState.pendingFlyTo).toEqual({
        longitude: -122.5,
        latitude: 37.5,
        zoom: 14,
      });
    });

    it("should call onClick callback when provided", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <VideoListItem video={baseVideo} onClick={handleClick} />
      );

      act(() => {
        fireEvent.click(screen.getByTestId("video-list-item"));
      });

      expect(handleClick).toHaveBeenCalledWith(baseVideo);
    });

    it("should trigger click on Enter key", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <VideoListItem video={baseVideo} onClick={handleClick} />
      );

      act(() => {
        fireEvent.keyDown(screen.getByTestId("video-list-item"), {
          key: "Enter",
        });
      });

      expect(handleClick).toHaveBeenCalledWith(baseVideo);
      expect(mapState.selectedVideoId).toBe("loc-1");
    });

    it("should trigger click on Space key", () => {
      const handleClick = jest.fn();
      renderWithProvider(
        <VideoListItem video={baseVideo} onClick={handleClick} />
      );

      act(() => {
        fireEvent.keyDown(screen.getByTestId("video-list-item"), {
          key: " ",
        });
      });

      expect(handleClick).toHaveBeenCalledWith(baseVideo);
    });
  });

  describe("hover handling", () => {
    it("should set highlightedVideoId on mouse enter", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      act(() => {
        fireEvent.mouseEnter(screen.getByTestId("video-list-item"));
      });

      expect(mapState.highlightedVideoId).toBe("loc-1");
    });

    it("should clear highlightedVideoId on mouse leave", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      act(() => {
        fireEvent.mouseEnter(screen.getByTestId("video-list-item"));
      });

      expect(mapState.highlightedVideoId).toBe("loc-1");

      act(() => {
        fireEvent.mouseLeave(screen.getByTestId("video-list-item"));
      });

      expect(mapState.highlightedVideoId).toBeNull();
    });
  });

  describe("accessibility", () => {
    it("should have role=button", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should be keyboard focusable with tabIndex", () => {
      renderWithProvider(<VideoListItem video={baseVideo} />);

      const item = screen.getByTestId("video-list-item");
      expect(item).toHaveAttribute("tabindex", "0");
    });
  });
});
