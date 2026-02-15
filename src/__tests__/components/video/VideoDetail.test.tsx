import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VideoDetail } from "@/components/video/VideoDetail";
import { getVideo } from "@/lib/api/videos";
import { useAuth } from "@/providers/AuthProvider";
import type { VideoDetailResponse } from "@/types/api";
import type { ReactNode } from "react";

// Mock the video API
jest.mock("@/lib/api/videos", () => ({
  getVideo: jest.fn(),
}));

// Mock auth provider
jest.mock("@/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock react-map-gl/mapbox for MiniMap
jest.mock("react-map-gl/mapbox", () => {
  const MockMap = React.forwardRef(
    (
      {
        children,
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      },
      _ref: React.Ref<unknown>
    ) => <div data-testid="mock-map">{children}</div>
  );
  MockMap.displayName = "MockMap";
  const MockMarker = (props: { latitude: number; longitude: number }) => (
    <div
      data-testid="mock-marker"
      data-lat={props.latitude}
      data-lng={props.longitude}
    />
  );
  return {
    __esModule: true,
    default: MockMap,
    Marker: MockMarker,
  };
});

// Mock mapbox CSS import
jest.mock("mapbox-gl/dist/mapbox-gl.css", () => ({}));

// Mock mapbox config
jest.mock("@/config/mapbox", () => ({
  MAPBOX_ACCESS_TOKEN: "test-token",
  MAPBOX_STYLE: "mapbox://styles/mapbox/streets-v12",
}));

// Mock moderation API for ModerationControls
jest.mock("@/lib/api/moderation", () => ({
  getModerationQueue: jest.fn(),
  approveItem: jest.fn(),
  rejectItem: jest.fn(),
}));

const mockGetVideo = getVideo as jest.MockedFunction<typeof getVideo>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockVideo: VideoDetailResponse = {
  id: "video-123",
  youtubeId: "dQw4w9WgXcQ",
  title: "Police Encounter at City Hall",
  description:
    "A long description of the video that should be truncated initially and expanded when the user clicks show more. This text is intentionally verbose to test the expand/collapse functionality.",
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
  durationSeconds: 185,
  channelId: "UC12345",
  channelName: "Accountability Channel",
  publishedAt: "2024-06-15T12:00:00Z",
  videoDate: "2024-06-10T00:00:00Z",
  amendments: ["FIRST", "FOURTH"],
  participants: ["POLICE", "CITIZEN"],
  status: "APPROVED",
  submittedBy: "user-456",
  createdAt: "2024-06-16T10:00:00Z",
  locations: [
    {
      id: "loc-1",
      videoId: "video-123",
      locationId: "location-1",
      isPrimary: true,
      location: {
        id: "location-1",
        displayName: "City Hall Plaza",
        city: "Springfield",
        state: "IL",
        coordinates: { latitude: 39.7817, longitude: -89.6501 },
      },
    },
  ],
  submitter: {
    id: "user-456",
    displayName: "JohnDoe",
  },
};

const defaultAuthValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
};

let queryClient: QueryClient;

function createWrapper() {
  return function TestQueryProvider({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("VideoDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockUseAuth.mockReturnValue(defaultAuthValue);
  });

  it("shows loading state initially", () => {
    // Mock getVideo to return a promise that never resolves
    mockGetVideo.mockImplementation(() => new Promise(() => {}));

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    expect(screen.getByText("Loading video...")).toBeInTheDocument();
  });

  it("shows video not found on error", async () => {
    mockGetVideo.mockRejectedValue(new Error("Not found"));

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Video not found.")).toBeInTheDocument();
    });

    const backLink = screen.getByText("Back to Map");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveAttribute("href", "/map");
  });

  it("renders video title and YouTube embed", async () => {
    mockGetVideo.mockResolvedValue(mockVideo);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Police Encounter at City Hall")
      ).toBeInTheDocument();
    });

    const iframe = document.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    expect(iframe).toHaveAttribute("title", "Police Encounter at City Hall");
  });

  it("renders amendment and participant chips", async () => {
    mockGetVideo.mockResolvedValue(mockVideo);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("1st Amendment")).toBeInTheDocument();
    });

    expect(screen.getByText("4th Amendment")).toBeInTheDocument();
    expect(screen.getByText("Police")).toBeInTheDocument();
    expect(screen.getByText("Citizen")).toBeInTheDocument();
  });

  it("renders channel name and duration", async () => {
    mockGetVideo.mockResolvedValue(mockVideo);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Accountability Channel")).toBeInTheDocument();
    });

    // 185 seconds = 3:05
    expect(screen.getByText("3:05")).toBeInTheDocument();
  });

  it("renders location with map link", async () => {
    mockGetVideo.mockResolvedValue(mockVideo);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText("City Hall Plaza, Springfield, IL")
      ).toBeInTheDocument();
    });

    const locationLink = screen.getByText("City Hall Plaza, Springfield, IL");
    expect(locationLink.closest("a")).toHaveAttribute(
      "href",
      "/map?lat=39.7817&lng=-89.6501&zoom=14"
    );

    // MiniMap should render
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("toggles description expand/collapse", async () => {
    mockGetVideo.mockResolvedValue(mockVideo);

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Show more")).toBeInTheDocument();
    });

    // Description should have line-clamp-3 initially
    const descriptionEl = screen.getByText(mockVideo.description!);
    expect(descriptionEl).toHaveClass("line-clamp-3");

    // Click "Show more"
    fireEvent.click(screen.getByText("Show more"));

    // Should now show "Show less" and remove line-clamp
    expect(screen.getByText("Show less")).toBeInTheDocument();
    expect(descriptionEl).not.toHaveClass("line-clamp-3");

    // Click "Show less"
    fireEvent.click(screen.getByText("Show less"));

    // Should revert back
    expect(screen.getByText("Show more")).toBeInTheDocument();
    expect(descriptionEl).toHaveClass("line-clamp-3");
  });

  it("shows status badge for video owner", async () => {
    mockGetVideo.mockResolvedValue(mockVideo);

    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: {
        id: "user-456",
        email: "john@example.com",
        emailVerified: true,
        displayName: "JohnDoe",
        trustTier: "BASIC",
      },
      isAuthenticated: true,
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("APPROVED")).toBeInTheDocument();
    });
  });

  it("does not show moderation controls for non-moderator", async () => {
    const pendingVideo: VideoDetailResponse = {
      ...mockVideo,
      status: "PENDING",
    };
    mockGetVideo.mockResolvedValue(pendingVideo);

    // Regular user who is NOT the owner and NOT a moderator
    mockUseAuth.mockReturnValue({
      ...defaultAuthValue,
      user: {
        id: "user-999",
        email: "regular@example.com",
        emailVerified: true,
        displayName: "RegularUser",
        trustTier: "BASIC",
      },
      isAuthenticated: true,
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <VideoDetail videoId="video-123" />
      </Wrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Police Encounter at City Hall")
      ).toBeInTheDocument();
    });

    // Moderation controls should NOT be present
    expect(screen.queryByText("Moderation")).not.toBeInTheDocument();
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();

    // Status badge should also NOT be visible (not owner, not moderator)
    expect(screen.queryByText("PENDING")).not.toBeInTheDocument();
  });
});
