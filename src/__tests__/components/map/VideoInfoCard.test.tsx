import { render, screen, fireEvent } from "@testing-library/react";
import { VideoInfoCard } from "@/components/map/VideoInfoCard";
import { MapProvider } from "@/providers/MapProvider";
import type { VideoLocation } from "@/types/map";

// Mock react-map-gl/mapbox Popup
let lastPopupProps: Record<string, unknown> = {};
jest.mock("react-map-gl/mapbox", () => ({
  Popup: (props: {
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
    closeOnClick?: boolean;
  }) => {
    lastPopupProps = props;
    return (
      <div data-testid="popup" className={props.className}>
        {props.children}
      </div>
    );
  },
}));

const renderWithProvider = (component: React.ReactNode) => {
  return render(<MapProvider>{component}</MapProvider>);
};

const baseVideo: VideoLocation = {
  id: "loc-1",
  videoId: "video-1",
  latitude: 37.7793,
  longitude: -122.4193,
  title: "Test Video Title",
  amendments: ["FIRST", "FOURTH"],
};

describe("VideoInfoCard", () => {
  beforeEach(() => {
    lastPopupProps = {};
  });

  describe("coordinate validation", () => {
    it("renders nothing for NaN latitude", () => {
      const { container } = renderWithProvider(
        <VideoInfoCard video={{ ...baseVideo, latitude: NaN }} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing for NaN longitude", () => {
      const { container } = renderWithProvider(
        <VideoInfoCard video={{ ...baseVideo, longitude: NaN }} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing for non-number latitude", () => {
      const { container } = renderWithProvider(
        <VideoInfoCard
          video={{ ...baseVideo, latitude: "bad" as unknown as number }}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing for non-number longitude", () => {
      const { container } = renderWithProvider(
        <VideoInfoCard
          video={{ ...baseVideo, longitude: "bad" as unknown as number }}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("popup configuration", () => {
    it("renders popup with closeOnClick enabled", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(lastPopupProps.closeOnClick).toBe(true);
    });

    it("renders popup with video-info-popup className", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(screen.getByTestId("popup")).toHaveClass("video-info-popup");
    });
  });

  describe("thumbnail rendering", () => {
    it("renders thumbnail when thumbnailUrl is provided", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
      };
      renderWithProvider(<VideoInfoCard video={video} />);

      const img = screen.getByAltText("Test Video Title");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        "src",
        "https://img.youtube.com/vi/abc/mqdefault.jpg"
      );
    });

    it("renders thumbnail with aspect-video class", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
      };
      renderWithProvider(<VideoInfoCard video={video} />);

      const img = screen.getByAltText("Test Video Title");
      expect(img.className).toContain("aspect-video");
    });

    it("wraps thumbnail in link to video detail page", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
      };
      renderWithProvider(<VideoInfoCard video={video} />);

      const img = screen.getByAltText("Test Video Title");
      const link = img.closest("a");
      expect(link).toHaveAttribute("href", "/videos/video-1");
    });

    it("does not render thumbnail when thumbnailUrl is missing", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(screen.queryByAltText("Test Video Title")).not.toBeInTheDocument();
    });
  });

  describe("duration badge", () => {
    it("renders duration badge on thumbnail", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
        duration: 185,
      };
      renderWithProvider(<VideoInfoCard video={video} />);
      expect(screen.getByText("3:05")).toBeInTheDocument();
    });

    it("does not render duration badge when duration is missing", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
      };
      renderWithProvider(<VideoInfoCard video={video} />);
      expect(screen.queryByText(/\d+:\d+/)).not.toBeInTheDocument();
    });
  });

  describe("title and metadata", () => {
    it("renders video title", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(screen.getByText("Test Video Title")).toBeInTheDocument();
    });

    it("renders amendment chips", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(screen.getByText("1st")).toBeInTheDocument();
      expect(screen.getByText("4th")).toBeInTheDocument();
    });

    it("renders recorded date when provided", () => {
      const video = { ...baseVideo, recordedAt: "2025-06-15T12:00:00" };
      renderWithProvider(<VideoInfoCard video={video} />);
      expect(screen.getByText(/Jun 15, 2025/)).toBeInTheDocument();
    });

    it("does not render date when recordedAt is missing", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(screen.queryByText(/Recorded:/)).not.toBeInTheDocument();
    });
  });

  describe("participant chips", () => {
    it("renders participant type chips", () => {
      const video = {
        ...baseVideo,
        participants: ["POLICE", "GOVERNMENT"],
      };
      renderWithProvider(<VideoInfoCard video={video} />);
      expect(screen.getByText("Police")).toBeInTheDocument();
      expect(screen.getByText("Government")).toBeInTheDocument();
    });

    it("does not render participant section when participants is empty", () => {
      const video = { ...baseVideo, participants: [] };
      renderWithProvider(<VideoInfoCard video={video} />);
      expect(screen.queryByText("Police")).not.toBeInTheDocument();
    });

    it("does not render participant section when participants is undefined", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(screen.queryByText("Police")).not.toBeInTheDocument();
    });
  });

  describe("close button", () => {
    it("renders close button with accessible label", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
      };
      renderWithProvider(<VideoInfoCard video={video} />);
      expect(
        screen.getByRole("button", { name: /close popup/i })
      ).toBeInTheDocument();
    });

    it("renders close button even without thumbnail", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      expect(
        screen.getByRole("button", { name: /close popup/i })
      ).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", () => {
      const onClose = jest.fn();
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
      };
      renderWithProvider(<VideoInfoCard video={video} onClose={onClose} />);

      fireEvent.click(screen.getByRole("button", { name: /close popup/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it("stops event propagation when close button clicked on thumbnail", () => {
      const video = {
        ...baseVideo,
        thumbnailUrl: "https://img.youtube.com/vi/abc/mqdefault.jpg",
      };
      renderWithProvider(<VideoInfoCard video={video} />);

      const closeBtn = screen.getByRole("button", { name: /close popup/i });
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      const stopProp = jest.fn();
      const preventDefault = jest.fn();
      Object.defineProperty(event, "stopPropagation", { value: stopProp });
      Object.defineProperty(event, "preventDefault", { value: preventDefault });
      closeBtn.dispatchEvent(event);

      expect(stopProp).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe("View Video link", () => {
    it("renders View Video link pointing to video detail", () => {
      renderWithProvider(<VideoInfoCard video={baseVideo} />);
      const link = screen.getByRole("link", { name: /view video/i });
      expect(link).toHaveAttribute("href", "/videos/video-1");
    });
  });
});
