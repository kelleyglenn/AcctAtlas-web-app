import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VideoSubmitForm } from "@/components/video/VideoSubmitForm";
import { previewVideo, createVideo } from "@/lib/api/videos";
import { createLocation } from "@/lib/api/locations";
import type { VideoPreview } from "@/types/api";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock API modules
jest.mock("@/lib/api/videos", () => ({
  previewVideo: jest.fn(),
  createVideo: jest.fn(),
}));

jest.mock("@/lib/api/locations", () => ({
  createLocation: jest.fn(),
}));

// Mock react-map-gl/mapbox
jest.mock("react-map-gl/mapbox", () => {
  const MockMap = React.forwardRef(
    (
      {
        children,
        ...props
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      },
      _ref: React.Ref<unknown>
    ) => (
      <div data-testid="mock-map" data-cursor={props.cursor}>
        {children}
      </div>
    )
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

// Mock @mapbox/search-js-react
jest.mock("@mapbox/search-js-react", () => ({
  SearchBox: (props: { placeholder?: string }) => (
    <input data-testid="mock-search-box" placeholder={props.placeholder} />
  ),
}));

// Mock mapbox-gl CSS import
jest.mock("mapbox-gl/dist/mapbox-gl.css", () => ({}));

// Mock mapbox config
jest.mock("@/config/mapbox", () => ({
  MAPBOX_ACCESS_TOKEN: "test-token",
  MAPBOX_STYLE: "mapbox://styles/mapbox/streets-v12",
}));

// Mock axios for error handling
jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return {
    ...actual,
    isAxiosError: (err: unknown) =>
      typeof err === "object" &&
      err !== null &&
      "isAxiosError" in err &&
      (err as { isAxiosError: boolean }).isAxiosError === true,
  };
});

const basePreview: VideoPreview = {
  youtubeId: "abc123",
  title: "First Amendment Audit - City Hall",
  description: "A test video description",
  thumbnailUrl: "https://img.youtube.com/vi/abc123/hqdefault.jpg",
  durationSeconds: 754,
  channelId: "channel1",
  channelName: "AuditChannel",
  publishedAt: "2024-06-15T10:00:00Z",
  alreadyExists: false,
};

const existingPreview: VideoPreview = {
  ...basePreview,
  alreadyExists: true,
  existingVideoId: "existing-video-456",
};

describe("VideoSubmitForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders YouTube URL input and Preview button", () => {
    render(<VideoSubmitForm />);

    expect(screen.getByText("YouTube URL")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("https://www.youtube.com/watch?v=...")
    ).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("clicking Preview calls previewVideo API", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });

    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(previewVideo).toHaveBeenCalledWith(
        "https://www.youtube.com/watch?v=abc123"
      );
    });
  });

  it("shows form fields after successful preview", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(
        screen.getByText("First Amendment Audit - City Hall")
      ).toBeInTheDocument();
    });

    // Amendment chips
    expect(screen.getByText("1st Amendment")).toBeInTheDocument();
    expect(screen.getByText("2nd Amendment")).toBeInTheDocument();
    expect(screen.getByText("4th Amendment")).toBeInTheDocument();
    expect(screen.getByText("5th Amendment")).toBeInTheDocument();
    expect(screen.getByText("14th Amendment")).toBeInTheDocument();

    // Participant chips
    expect(screen.getByText("Police")).toBeInTheDocument();
    expect(screen.getByText("Government")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("Citizen")).toBeInTheDocument();

    // Date input
    expect(screen.getByText("Incident Date (optional)")).toBeInTheDocument();

    // Location picker (via mock map)
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();

    // Submit button
    expect(screen.getByText("Submit Video")).toBeInTheDocument();
  });

  it("shows already-exists message when video exists", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(existingPreview);

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("View it here.")).toBeInTheDocument();
    });

    // The message appears both as Input error and as the amber warning box
    const messages = screen.getAllByText(
      /This video has already been submitted/
    );
    expect(messages.length).toBeGreaterThanOrEqual(1);

    // Should show link to existing video in the amber warning
    const viewLink = screen.getByText("View it here.");
    expect(viewLink.closest("a")).toHaveAttribute(
      "href",
      "/videos/existing-video-456"
    );

    // Submit button should NOT be visible
    expect(screen.queryByText("Submit Video")).not.toBeInTheDocument();
  });

  it("shows validation errors when submitting without required fields", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);

    render(<VideoSubmitForm />);

    // First load the preview
    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("Submit Video")).toBeInTheDocument();
    });

    // Submit without selecting anything
    fireEvent.click(screen.getByText("Submit Video"));

    expect(
      screen.getByText("Select at least one amendment.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select at least one participant type.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Click the map to place a location.")
    ).toBeInTheDocument();

    // Should not have called createLocation or createVideo
    expect(createLocation).not.toHaveBeenCalled();
    expect(createVideo).not.toHaveBeenCalled();
  });

  it("shows URL error for 400 response", async () => {
    (previewVideo as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { status: 400 },
    });

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "not-a-valid-url" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid YouTube URL.")
      ).toBeInTheDocument();
    });
  });

  it("shows URL error for 422 response", async () => {
    (previewVideo as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { status: 422 },
    });

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=private123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(
        screen.getByText("This video is unavailable or private.")
      ).toBeInTheDocument();
    });
  });

  it("toggles amendment selection", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("1st Amendment")).toBeInTheDocument();
    });

    const firstAmendmentChip = screen.getByText("1st Amendment");

    // Initially not selected (no bg-blue-600 class)
    expect(firstAmendmentChip.closest("span")).not.toHaveClass("bg-blue-600");

    // Click to select
    fireEvent.click(firstAmendmentChip);
    expect(firstAmendmentChip.closest("span")).toHaveClass("bg-blue-600");

    // Click again to deselect
    fireEvent.click(firstAmendmentChip);
    expect(firstAmendmentChip.closest("span")).not.toHaveClass("bg-blue-600");
  });

  it("toggles participant selection", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("Police")).toBeInTheDocument();
    });

    const policeChip = screen.getByText("Police");

    // Initially not selected
    expect(policeChip.closest("span")).not.toHaveClass("bg-blue-600");

    // Click to select
    fireEvent.click(policeChip);
    expect(policeChip.closest("span")).toHaveClass("bg-blue-600");

    // Click again to deselect
    fireEvent.click(policeChip);
    expect(policeChip.closest("span")).not.toHaveClass("bg-blue-600");
  });
});
