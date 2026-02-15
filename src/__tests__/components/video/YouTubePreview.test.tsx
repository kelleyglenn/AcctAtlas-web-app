import { render, screen } from "@testing-library/react";
import { YouTubePreview } from "@/components/video/YouTubePreview";
import type { VideoPreview } from "@/types/api";

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

describe("YouTubePreview", () => {
  it("renders the video title", () => {
    render(<YouTubePreview preview={basePreview} />);
    expect(
      screen.getByText("First Amendment Audit - City Hall")
    ).toBeInTheDocument();
  });

  it("renders the channel name", () => {
    render(<YouTubePreview preview={basePreview} />);
    expect(screen.getByText("AuditChannel")).toBeInTheDocument();
  });

  it("renders the thumbnail image with correct src and alt", () => {
    render(<YouTubePreview preview={basePreview} />);
    const img = screen.getByAltText("First Amendment Audit - City Hall");
    expect(img).toBeInTheDocument();
    // Next.js <Image> rewrites src through its image optimizer
    expect(img.getAttribute("src")).toContain(
      encodeURIComponent("https://img.youtube.com/vi/abc123/hqdefault.jpg")
    );
  });

  it("formats duration correctly as minutes:seconds", () => {
    render(<YouTubePreview preview={basePreview} />);
    // 754 seconds = 12 minutes, 34 seconds
    expect(screen.getByText("12:34")).toBeInTheDocument();
  });

  it("formats single-digit seconds with leading zero", () => {
    const preview = { ...basePreview, durationSeconds: 303 };
    render(<YouTubePreview preview={preview} />);
    // 303 seconds = 5 minutes, 3 seconds
    expect(screen.getByText("5:03")).toBeInTheDocument();
  });

  it("does not render duration when durationSeconds is undefined", () => {
    const preview = { ...basePreview, durationSeconds: undefined };
    render(<YouTubePreview preview={preview} />);
    expect(screen.queryByText(/:/)).toBeNull();
  });

  it("renders the published date", () => {
    render(<YouTubePreview preview={basePreview} />);
    const dateText = screen.getByText(/Published/);
    expect(dateText).toBeInTheDocument();
  });
});
