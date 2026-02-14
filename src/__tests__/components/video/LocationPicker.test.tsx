import React from "react";
import { render, screen } from "@testing-library/react";
import { LocationPicker } from "@/components/video/LocationPicker";

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

// Mock mapbox-gl CSS import
jest.mock("mapbox-gl/dist/mapbox-gl.css", () => ({}));

// Mock config
jest.mock("@/config/mapbox", () => ({
  MAPBOX_ACCESS_TOKEN: "test-token",
  MAPBOX_STYLE: "mapbox://styles/mapbox/streets-v12",
}));

// Mock locations API
jest.mock("@/lib/api/locations", () => ({
  reverseGeocode: jest.fn(),
}));

describe("LocationPicker", () => {
  it("renders the map container", () => {
    render(<LocationPicker onLocationChange={jest.fn()} />);
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("renders the location label", () => {
    render(<LocationPicker onLocationChange={jest.fn()} />);
    expect(screen.getByText("Location")).toBeInTheDocument();
  });

  it("renders help text", () => {
    render(<LocationPicker onLocationChange={jest.fn()} />);
    expect(
      screen.getByText(/Click the map to place a marker/)
    ).toBeInTheDocument();
  });

  it("renders error message when error prop is provided", () => {
    render(
      <LocationPicker
        onLocationChange={jest.fn()}
        error="Click the map to place a location."
      />
    );
    expect(
      screen.getByText("Click the map to place a location.")
    ).toBeInTheDocument();
  });

  it("does not render error when error prop is not provided", () => {
    render(<LocationPicker onLocationChange={jest.fn()} />);
    const errorElements = screen.queryAllByText(
      /Click the map to place a location/
    );
    // Only the help text should match, not an error
    expect(
      errorElements.every((el) => !el.classList.contains("text-red-600"))
    ).toBe(true);
  });

  it("sets crosshair cursor on the map", () => {
    render(<LocationPicker onLocationChange={jest.fn()} />);
    const map = screen.getByTestId("mock-map");
    expect(map).toHaveAttribute("data-cursor", "crosshair");
  });
});
