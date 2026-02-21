import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VideoSubmitForm } from "@/components/video/VideoSubmitForm";
import {
  previewVideo,
  createVideo,
  extractVideoMetadata,
} from "@/lib/api/videos";
import {
  createLocation,
  reverseGeocode,
  geocodeAddress,
} from "@/lib/api/locations";
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
  extractVideoMetadata: jest.fn(),
}));

jest.mock("@/lib/api/locations", () => ({
  createLocation: jest.fn(),
  reverseGeocode: jest.fn(),
  geocodeAddress: jest.fn(),
}));

// Mock react-map-gl/mapbox
jest.mock("react-map-gl/mapbox", () => {
  const MockMap = React.forwardRef(
    (
      {
        children,
        onClick,
        ...props
      }: {
        children?: React.ReactNode;
        onClick?: (e: { lngLat: { lng: number; lat: number } }) => void;
        [key: string]: unknown;
      },
      _ref: React.Ref<unknown>
    ) => (
      <div
        data-testid="mock-map"
        data-cursor={props.cursor}
        onClick={() => onClick?.({ lngLat: { lng: -74.006, lat: 40.7128 } })}
      >
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
    // Toast uses crypto.randomUUID which isn't available in jsdom
    Object.defineProperty(global, "crypto", {
      value: { randomUUID: () => "test-uuid" },
      writable: true,
    });
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

  it("submits video after selecting amendments, participants, and location", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);
    (reverseGeocode as jest.Mock).mockResolvedValue({
      displayName: "New York City Hall",
      address: "260 Broadway",
      city: "New York",
      state: "NY",
      country: "US",
    });
    (createLocation as jest.Mock).mockResolvedValue({
      id: "loc-new-1",
      displayName: "New York City Hall",
    });
    (createVideo as jest.Mock).mockResolvedValue({
      id: "video-new-1",
      youtubeId: "abc123",
      title: "First Amendment Audit - City Hall",
      amendments: ["FIRST"],
      participants: ["POLICE"],
      status: "PENDING",
    });

    render(<VideoSubmitForm />);

    // Step 1: Preview
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

    // Step 2: Select amendment and participant
    fireEvent.click(screen.getByText("1st Amendment"));
    fireEvent.click(screen.getByText("Police"));

    // Step 3: Click map to place location
    fireEvent.click(screen.getByTestId("mock-map"));

    // Wait for reverse geocode to resolve
    await waitFor(() => {
      expect(reverseGeocode).toHaveBeenCalledWith(40.7128, -74.006);
    });

    // Step 4: Submit
    fireEvent.click(screen.getByText("Submit Video"));

    await waitFor(() => {
      expect(createLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinates: { latitude: 40.7128, longitude: -74.006 },
          displayName: "New York City Hall",
        })
      );
    });

    expect(createVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        youtubeUrl: "https://www.youtube.com/watch?v=abc123",
        amendments: ["FIRST"],
        participants: ["POLICE"],
        locationId: "loc-new-1",
      })
    );

    expect(mockPush).toHaveBeenCalledWith("/videos/video-new-1");
  });

  it("displays field-specific validation errors from 400 response", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);
    (reverseGeocode as jest.Mock).mockResolvedValue({
      displayName: "Test Location",
      city: "Test City",
      state: "TS",
      country: "US",
    });
    (createLocation as jest.Mock).mockResolvedValue({
      id: "loc-1",
      displayName: "Test Location",
    });
    (createVideo as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: [
            {
              field: "amendments",
              message: "size must be between 1 and 2147483647",
            },
          ],
        },
      },
    });

    render(<VideoSubmitForm />);

    // Preview
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

    // Select fields to pass client-side validation
    fireEvent.click(screen.getByText("1st Amendment"));
    fireEvent.click(screen.getByText("Police"));
    fireEvent.click(screen.getByTestId("mock-map"));
    await waitFor(() => {
      expect(reverseGeocode).toHaveBeenCalled();
    });

    // Submit
    fireEvent.click(screen.getByText("Submit Video"));

    // Verify field-specific error is shown
    await waitFor(() => {
      expect(
        screen.getByText("size must be between 1 and 2147483647")
      ).toBeInTheDocument();
    });
  });

  it("shows Auto-fill button after successful preview", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);

    render(<VideoSubmitForm />);

    // Auto-fill button should not be visible before preview
    expect(screen.queryByText("Auto-fill with AI")).not.toBeInTheDocument();

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("Auto-fill with AI")).toBeInTheDocument();
    });
  });

  it("populates fields after clicking Auto-fill with AI", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);
    (extractVideoMetadata as jest.Mock).mockResolvedValue({
      amendments: ["FIRST", "FOURTH"],
      participants: ["POLICE", "CITIZEN"],
      videoDate: "2024-03-15",
      location: {
        name: "City Hall",
        city: "Springfield",
        state: "IL",
        latitude: 39.7817,
        longitude: -89.6501,
      },
      confidence: {
        amendments: 0.9,
        participants: 0.85,
        videoDate: 0.6,
        location: 0.8,
      },
    });

    render(<VideoSubmitForm />);

    // Preview first
    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("Auto-fill with AI")).toBeInTheDocument();
    });

    // Click Auto-fill
    fireEvent.click(screen.getByText("Auto-fill with AI"));

    await waitFor(() => {
      expect(extractVideoMetadata).toHaveBeenCalledWith(
        "https://www.youtube.com/watch?v=abc123"
      );
    });

    // Check amendments are selected
    await waitFor(() => {
      const firstChip = screen.getByText("1st Amendment").closest("span");
      expect(firstChip).toHaveClass("bg-blue-600");
    });

    const fourthChip = screen.getByText("4th Amendment").closest("span");
    expect(fourthChip).toHaveClass("bg-blue-600");

    // Check participants are selected
    const policeChip = screen.getByText("Police").closest("span");
    expect(policeChip).toHaveClass("bg-blue-600");
    const citizenChip = screen.getByText("Citizen").closest("span");
    expect(citizenChip).toHaveClass("bg-blue-600");
  });

  it("shows error toast when AI extraction fails with 503", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);
    (extractVideoMetadata as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { status: 503 },
    });

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("Auto-fill with AI")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Auto-fill with AI"));

    await waitFor(() => {
      expect(
        screen.getByText("AI extraction unavailable. Please fill in manually.")
      ).toBeInTheDocument();
    });
  });

  it("geocodes location when AI returns name but no coordinates", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);
    (extractVideoMetadata as jest.Mock).mockResolvedValue({
      amendments: ["FIRST"],
      participants: ["POLICE"],
      videoDate: null,
      location: {
        name: "City Hall",
        city: "Springfield",
        state: "IL",
        latitude: null,
        longitude: null,
      },
      confidence: {
        amendments: 0.9,
        participants: 0.85,
        videoDate: null,
        location: 0.7,
      },
    });
    (geocodeAddress as jest.Mock).mockResolvedValue({
      displayName: "City Hall",
      city: "Springfield",
      state: "IL",
      latitude: 39.7817,
      longitude: -89.6501,
    });

    render(<VideoSubmitForm />);

    const urlInput = screen.getByPlaceholderText(
      "https://www.youtube.com/watch?v=..."
    );
    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(screen.getByText("Auto-fill with AI")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Auto-fill with AI"));

    await waitFor(() => {
      expect(geocodeAddress).toHaveBeenCalledWith("City Hall, Springfield, IL");
    });
  });

  it("shows generic error for non-validation server errors", async () => {
    (previewVideo as jest.Mock).mockResolvedValue(basePreview);
    (reverseGeocode as jest.Mock).mockResolvedValue({
      displayName: "Test Location",
      city: "Test City",
      state: "TS",
      country: "US",
    });
    (createLocation as jest.Mock).mockResolvedValue({
      id: "loc-1",
      displayName: "Test Location",
    });
    (createVideo as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { status: 500 },
    });

    render(<VideoSubmitForm />);

    // Preview
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

    // Select fields
    fireEvent.click(screen.getByText("1st Amendment"));
    fireEvent.click(screen.getByText("Police"));
    fireEvent.click(screen.getByTestId("mock-map"));
    await waitFor(() => {
      expect(reverseGeocode).toHaveBeenCalled();
    });

    // Submit
    fireEvent.click(screen.getByText("Submit Video"));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to submit video. Please try again.")
      ).toBeInTheDocument();
    });
  });
});
