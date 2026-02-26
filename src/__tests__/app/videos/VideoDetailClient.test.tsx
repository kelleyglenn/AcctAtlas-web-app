import { render, screen } from "@testing-library/react";

const mockUseParams = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
}));

jest.mock("next/dynamic", () => {
  return jest.fn(() => {
    const MockComponent = ({ videoId }: { videoId: string }) => (
      <div data-testid="video-detail">videoId={videoId}</div>
    );
    MockComponent.displayName = "MockVideoDetail";
    return MockComponent;
  });
});

import VideoDetailClient from "@/app/videos/[id]/VideoDetailClient";

describe("VideoDetailClient", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ id: "test-video-id" });
  });

  it("renders VideoDetail with videoId from params", () => {
    render(<VideoDetailClient />);
    expect(screen.getByTestId("video-detail")).toHaveTextContent(
      "videoId=test-video-id"
    );
  });

  it("handles array params by using first element", () => {
    mockUseParams.mockReturnValue({ id: ["first-id", "second-id"] });

    render(<VideoDetailClient />);
    expect(screen.getByTestId("video-detail")).toHaveTextContent(
      "videoId=first-id"
    );
  });
});
