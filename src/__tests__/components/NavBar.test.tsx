import { render, screen } from "@testing-library/react";
import { NavBar } from "@/components/NavBar";

const mockLogout = jest.fn();
let mockAuth: {
  user: unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: jest.Mock;
} = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  logout: mockLogout,
};
jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => mockAuth,
}));

let mockPathname = "/other";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("NavBar", () => {
  beforeEach(() => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: mockLogout,
    };
    mockLogout.mockClear();
    mockPathname = "/other";
  });

  it("shows site name linking to home", () => {
    render(<NavBar />);
    const link = screen.getByText("AccountabilityAtlas");
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });

  it("shows Explore Map link", () => {
    render(<NavBar />);
    expect(screen.getByText("Explore Map").closest("a")).toHaveAttribute(
      "href",
      "/map"
    );
  });

  it("shows Sign In when not authenticated", () => {
    render(<NavBar />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.queryByText("Submit Video")).not.toBeInTheDocument();
  });

  it("shows Submit Video and user info when authenticated", () => {
    mockAuth = {
      user: {
        id: "1",
        displayName: "Test User",
        email: "t@t.com",
        emailVerified: true,
        trustTier: "NEW",
      },
      isAuthenticated: true,
      isLoading: false,
      logout: mockLogout,
    };
    render(<NavBar />);
    expect(screen.getByText("Submit Video")).toBeInTheDocument();
    expect(screen.getByText("Test User").closest("a")).toHaveAttribute(
      "href",
      "/profile"
    );
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  describe("conditional transparency", () => {
    it("is transparent with no border on home page", () => {
      mockPathname = "/";
      render(<NavBar />);
      const nav = screen.getByRole("navigation");
      expect(nav.className).toContain("bg-transparent");
      expect(nav.className).not.toContain("border-b");
    });

    it("is opaque white with border on non-home pages", () => {
      mockPathname = "/map";
      render(<NavBar />);
      const nav = screen.getByRole("navigation");
      expect(nav.className).toContain("bg-white");
      expect(nav.className).toContain("border-b");
    });

    it("uses white text for logo on home page", () => {
      mockPathname = "/";
      render(<NavBar />);
      const logo = screen.getByText("AccountabilityAtlas");
      expect(logo.className).toContain("text-white");
    });

    it("uses dark text for logo on non-home pages", () => {
      mockPathname = "/map";
      render(<NavBar />);
      const logo = screen.getByText("AccountabilityAtlas");
      expect(logo.className).toContain("text-gray-900");
    });

    it("uses white border/text for outline buttons on home page", () => {
      mockPathname = "/";
      render(<NavBar />);
      const signIn = screen.getByText("Sign In");
      expect(signIn.className).toContain("border-white");
      expect(signIn.className).toContain("text-white");
    });

    it("uses white text for authenticated links on home page", () => {
      mockPathname = "/";
      mockAuth = {
        user: { id: "1", displayName: "Test User" },
        isAuthenticated: true,
        isLoading: false,
        logout: mockLogout,
      };
      render(<NavBar />);
      const profileLink = screen.getByText("Test User");
      expect(profileLink.className).toContain("text-white");
    });
  });
});
