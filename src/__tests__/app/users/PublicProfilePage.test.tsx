import { render, screen } from "@testing-library/react";
import PublicProfilePage from "@/app/users/[id]/PublicProfileClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockParams = { id: "user-123" };
jest.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

jest.mock("@/lib/api/users", () => ({
  getPublicProfile: jest.fn(),
}));

import { getPublicProfile } from "@/lib/api/users";

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("PublicProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state initially", () => {
    (getPublicProfile as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderWithQuery(<PublicProfilePage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state when user not found", async () => {
    (getPublicProfile as jest.Mock).mockRejectedValue(new Error("Not found"));
    renderWithQuery(<PublicProfilePage />);
    expect(await screen.findByText("User not found.")).toBeInTheDocument();
    expect(screen.getByText("Back to Map")).toBeInTheDocument();
  });

  it("renders profile with display name and stats", async () => {
    (getPublicProfile as jest.Mock).mockResolvedValue({
      id: "user-123",
      displayName: "PublicUser",
      memberSince: "2026-01-01T00:00:00Z",
      approvedVideoCount: 5,
    });

    renderWithQuery(<PublicProfilePage />);

    expect(await screen.findByText("PublicUser")).toBeInTheDocument();
    expect(screen.getByText(/5 approved videos/)).toBeInTheDocument();
  });

  it("renders singular video count correctly", async () => {
    (getPublicProfile as jest.Mock).mockResolvedValue({
      id: "user-123",
      displayName: "OneVideoUser",
      memberSince: "2026-01-01T00:00:00Z",
      approvedVideoCount: 1,
    });

    renderWithQuery(<PublicProfilePage />);

    expect(await screen.findByText(/1 approved video$/)).toBeInTheDocument();
  });

  it("renders trust tier badge when present", async () => {
    (getPublicProfile as jest.Mock).mockResolvedValue({
      id: "user-123",
      displayName: "TrustedUser",
      trustTier: "TRUSTED",
      memberSince: "2026-01-01T00:00:00Z",
      approvedVideoCount: 10,
    });

    renderWithQuery(<PublicProfilePage />);

    expect(await screen.findByTestId("trust-tier-badge")).toHaveTextContent(
      "TRUSTED"
    );
  });

  it("renders social links when present", async () => {
    (getPublicProfile as jest.Mock).mockResolvedValue({
      id: "user-123",
      displayName: "SocialUser",
      memberSince: "2026-01-01T00:00:00Z",
      approvedVideoCount: 0,
      socialLinks: { youtube: "UCtest", instagram: "testaccount" },
    });

    renderWithQuery(<PublicProfilePage />);

    expect(await screen.findByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
  });

  it("does not render social links section when none present", async () => {
    (getPublicProfile as jest.Mock).mockResolvedValue({
      id: "user-123",
      displayName: "NoSocialUser",
      memberSince: "2026-01-01T00:00:00Z",
      approvedVideoCount: 0,
    });

    renderWithQuery(<PublicProfilePage />);

    await screen.findByText("NoSocialUser");
    expect(screen.queryByText("Social Links")).not.toBeInTheDocument();
  });

  it("renders avatar when avatarUrl is present", async () => {
    (getPublicProfile as jest.Mock).mockResolvedValue({
      id: "user-123",
      displayName: "AvatarUser",
      avatarUrl: "https://example.com/avatar.jpg",
      memberSince: "2026-01-01T00:00:00Z",
      approvedVideoCount: 0,
    });

    renderWithQuery(<PublicProfilePage />);

    await screen.findByText("AvatarUser");
    const img = screen.getByAltText("AvatarUser's avatar");
    expect(img).toBeInTheDocument();
  });
});
