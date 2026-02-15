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

describe("NavBar", () => {
  beforeEach(() => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: mockLogout,
    };
    mockLogout.mockClear();
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
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });
});
