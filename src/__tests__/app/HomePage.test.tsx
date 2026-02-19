import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

let mockAuth: { isAuthenticated: boolean } = { isAuthenticated: false };
jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => mockAuth,
}));

jest.mock("@/components/HeroMap", () => ({
  HeroMap: () => <div data-testid="hero-map" />,
}));

describe("HomePage", () => {
  beforeEach(() => {
    mockAuth = { isAuthenticated: false };
  });

  describe("Hero Section", () => {
    it("renders the headline", () => {
      render(<HomePage />);
      expect(
        screen.getByRole("heading", {
          name: "See Where Constitutional Rights Are Tested",
        })
      ).toBeInTheDocument();
    });

    it("renders the subheadline", () => {
      render(<HomePage />);
      expect(
        screen.getByText(/organizes citizen-recorded audit videos/)
      ).toBeInTheDocument();
    });

    it("renders the HeroMap background", () => {
      render(<HomePage />);
      expect(screen.getByTestId("hero-map")).toBeInTheDocument();
    });
  });

  describe("CTAs for unauthenticated user", () => {
    it("shows Explore the Map link", () => {
      render(<HomePage />);
      const links = screen.getAllByRole("link", { name: "Explore the Map" });
      expect(links[0]).toHaveAttribute("href", "/map");
    });

    it("shows Create Free Account link", () => {
      render(<HomePage />);
      const links = screen.getAllByRole("link", {
        name: "Create Free Account",
      });
      expect(links.length).toBe(2); // Hero + Final CTA
      expect(links[0]).toHaveAttribute("href", "/register");
    });

    it("does not show Submit a Video link", () => {
      render(<HomePage />);
      expect(
        screen.queryByRole("link", { name: "Submit a Video" })
      ).not.toBeInTheDocument();
    });
  });

  describe("CTAs for authenticated user", () => {
    beforeEach(() => {
      mockAuth = { isAuthenticated: true };
    });

    it("shows Submit a Video link instead of Create Free Account", () => {
      render(<HomePage />);
      const submitLinks = screen.getAllByRole("link", {
        name: "Submit a Video",
      });
      expect(submitLinks.length).toBe(2); // Hero + Final CTA
      expect(submitLinks[0]).toHaveAttribute("href", "/videos/new");
      expect(
        screen.queryByRole("link", { name: "Create Free Account" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Stats Strip", () => {
    it("renders all three stats", () => {
      render(<HomePage />);
      expect(screen.getByText("8,000+ Videos Mapped")).toBeInTheDocument();
      expect(screen.getByText("All 50 States Represented")).toBeInTheDocument();
      expect(
        screen.getByText("1st, 2nd, 4th, 5th, and 14th Amendments Indexed")
      ).toBeInTheDocument();
    });
  });

  describe("How It Works", () => {
    it("renders the section heading", () => {
      render(<HomePage />);
      expect(
        screen.getByRole("heading", {
          name: "How AccountabilityAtlas Works",
        })
      ).toBeInTheDocument();
    });

    it("renders three cards", () => {
      render(<HomePage />);
      expect(
        screen.getByRole("heading", { name: "Discover" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Understand" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Contribute" })
      ).toBeInTheDocument();
    });
  });

  describe("Why It Matters", () => {
    it("renders the section heading", () => {
      render(<HomePage />);
      expect(
        screen.getByRole("heading", {
          name: "Why Geographic Context Changes Everything",
        })
      ).toBeInTheDocument();
    });

    it("renders three cards", () => {
      render(<HomePage />);
      expect(
        screen.getByRole("heading", { name: "Pattern Recognition" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Public Record" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Civic Transparency" })
      ).toBeInTheDocument();
    });
  });

  describe("Final CTA", () => {
    it("renders the section heading", () => {
      render(<HomePage />);
      expect(
        screen.getByRole("heading", { name: "Start Exploring" })
      ).toBeInTheDocument();
    });

    it("renders the description", () => {
      render(<HomePage />);
      expect(
        screen.getByText("No account required to browse the map.")
      ).toBeInTheDocument();
    });
  });
});
