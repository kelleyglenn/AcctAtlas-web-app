import { render, screen } from "@testing-library/react";
import { HeroMap } from "@/components/HeroMap";

jest.mock("react-map-gl/mapbox", () => {
  const MockMap = (props: Record<string, unknown>) => (
    <div
      data-testid="mock-map"
      data-interactive={String(props.interactive)}
      data-attribution={String(props.attributionControl)}
    />
  );
  return { __esModule: true, default: MockMap };
});

jest.mock("mapbox-gl/dist/mapbox-gl.css", () => ({}));

describe("HeroMap", () => {
  it("renders a map component", () => {
    render(<HeroMap />);
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("disables interactivity", () => {
    render(<HeroMap />);
    expect(screen.getByTestId("mock-map")).toHaveAttribute(
      "data-interactive",
      "false"
    );
  });

  it("disables attribution control", () => {
    render(<HeroMap />);
    expect(screen.getByTestId("mock-map")).toHaveAttribute(
      "data-attribution",
      "false"
    );
  });

  it("uses cursor-default on container", () => {
    render(<HeroMap />);
    const container = screen.getByTestId("mock-map").parentElement;
    expect(container?.className).toContain("cursor-default");
  });
});
