import { render, screen } from "@testing-library/react";
import { MySubmissions } from "@/components/profile/MySubmissions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1", displayName: "TestUser" },
  }),
}));

jest.mock("@/lib/api/videos", () => ({
  getUserVideos: jest.fn(),
}));

import { getUserVideos } from "@/lib/api/videos";

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("MySubmissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    (getUserVideos as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithQuery(<MySubmissions />);
    expect(screen.getByText("Loading submissions...")).toBeInTheDocument();
  });

  it("shows empty message when no videos", async () => {
    (getUserVideos as jest.Mock).mockResolvedValue([]);
    renderWithQuery(<MySubmissions />);
    expect(await screen.findByText("No submissions yet.")).toBeInTheDocument();
  });

  it("renders video submissions with status badges", async () => {
    (getUserVideos as jest.Mock).mockResolvedValue([
      {
        id: "v1",
        title: "Test Video",
        thumbnailUrl: "https://example.com/thumb.jpg",
        status: "APPROVED",
        createdAt: "2026-01-15T10:00:00Z",
      },
      {
        id: "v2",
        title: "Pending Video",
        thumbnailUrl: null,
        status: "PENDING",
        createdAt: "2026-01-16T10:00:00Z",
      },
    ]);

    renderWithQuery(<MySubmissions />);

    expect(await screen.findByText("Test Video")).toBeInTheDocument();
    expect(screen.getByText("Pending Video")).toBeInTheDocument();
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("shows rejection reason for rejected videos", async () => {
    (getUserVideos as jest.Mock).mockResolvedValue([
      {
        id: "v1",
        title: "Rejected Video",
        status: "REJECTED",
        rejectionReason: "Off topic",
        createdAt: "2026-01-15T10:00:00Z",
      },
    ]);

    renderWithQuery(<MySubmissions />);

    expect(await screen.findByText("Reason: Off topic")).toBeInTheDocument();
  });

  it("links videos to their detail page", async () => {
    (getUserVideos as jest.Mock).mockResolvedValue([
      {
        id: "v1",
        title: "Test Video",
        status: "APPROVED",
        createdAt: "2026-01-15T10:00:00Z",
      },
    ]);

    renderWithQuery(<MySubmissions />);

    const link = await screen.findByTestId("submission-item");
    expect(link).toHaveAttribute("href", "/videos/v1");
  });
});
