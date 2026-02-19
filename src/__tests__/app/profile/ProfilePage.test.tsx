import { render, screen, fireEvent } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSuccess = jest.fn();
const mockError = jest.fn();
jest.mock("@/components/ui/Toast", () => ({
  useToasts: () => ({
    toasts: [],
    dismissToast: jest.fn(),
    success: mockSuccess,
    error: mockError,
  }),
  ToastContainer: () => null,
}));

const mockLogout = jest.fn();
const mockRefreshUser = jest.fn();
let mockAuth: {
  user: unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: jest.Mock;
  refreshUser: jest.Mock;
};

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => mockAuth,
}));

// Stub child components — they have their own tests.
// ProfileInfoForm exposes buttons to trigger the parent callbacks.
jest.mock("@/components/profile/ProfileInfoForm", () => ({
  ProfileInfoForm: ({
    onUpdate,
    onSuccess,
    onError,
  }: {
    onUpdate: () => void;
    onSuccess: () => void;
    onError: (msg: string) => void;
  }) => (
    <div data-testid="profile-info-form">
      <button data-testid="trigger-update" onClick={onUpdate} />
      <button data-testid="trigger-success" onClick={onSuccess} />
      <button
        data-testid="trigger-error"
        onClick={() => onError("test error")}
      />
    </div>
  ),
}));
jest.mock("@/components/profile/SocialLinksForm", () => ({
  SocialLinksForm: () => <div data-testid="social-links-form" />,
}));
jest.mock("@/components/profile/PrivacySettingsForm", () => ({
  PrivacySettingsForm: () => <div data-testid="privacy-settings-form" />,
}));
jest.mock("@/components/profile/AvatarPicker", () => ({
  AvatarPicker: () => <div data-testid="avatar-picker" />,
}));
jest.mock("@/components/profile/MySubmissions", () => ({
  MySubmissions: () => <div data-testid="my-submissions" />,
}));

const fullUser = {
  id: "1",
  email: "test@example.com",
  emailVerified: true,
  displayName: "TestUser",
  trustTier: "NEW",
  createdAt: "2026-01-15T10:00:00Z",
  socialLinks: { youtube: "UCtest" },
  privacySettings: {
    socialLinksVisibility: "REGISTERED",
    submissionsVisibility: "PUBLIC",
  },
};

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSuccess.mockClear();
    mockError.mockClear();
    mockAuth = {
      user: fullUser,
      isAuthenticated: true,
      isLoading: false,
      logout: mockLogout,
      refreshUser: mockRefreshUser,
    };
  });

  it("shows loading state when auth is loading", () => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      logout: mockLogout,
      refreshUser: mockRefreshUser,
    };

    render(<ProfilePage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: mockLogout,
      refreshUser: mockRefreshUser,
    };

    render(<ProfilePage />);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("returns null when user is null and not loading", () => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: mockLogout,
      refreshUser: mockRefreshUser,
    };

    const { container } = render(<ProfilePage />);
    // After redirect effect, component returns null for !user
    expect(container.querySelector("main")).not.toBeInTheDocument();
  });

  it("renders user display name and email", () => {
    render(<ProfilePage />);
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders trust tier badge", () => {
    render(<ProfilePage />);
    expect(screen.getByTestId("trust-tier-badge")).toHaveTextContent("NEW");
  });

  it("renders member since date", () => {
    render(<ProfilePage />);
    expect(screen.getByText(/Member since/)).toBeInTheDocument();
  });

  it("renders all profile sections", () => {
    render(<ProfilePage />);
    expect(screen.getByText("Profile Info")).toBeInTheDocument();
    expect(screen.getByText("Social Links")).toBeInTheDocument();
    expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
    expect(screen.getByText("My Submissions")).toBeInTheDocument();
  });

  it("renders child components", () => {
    render(<ProfilePage />);
    expect(screen.getByTestId("avatar-picker")).toBeInTheDocument();
    expect(screen.getByTestId("profile-info-form")).toBeInTheDocument();
    expect(screen.getByTestId("social-links-form")).toBeInTheDocument();
    expect(screen.getByTestId("privacy-settings-form")).toBeInTheDocument();
    expect(screen.getByTestId("my-submissions")).toBeInTheDocument();
  });

  it("renders Back to Home and Sign Out buttons", () => {
    render(<ProfilePage />);
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("calls logout and navigates home on Sign Out click", () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("calls refreshUser on mount when authenticated", () => {
    render(<ProfilePage />);
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it("renders without createdAt when not present", () => {
    mockAuth = {
      ...mockAuth,
      user: { ...fullUser, createdAt: undefined },
    };

    render(<ProfilePage />);
    expect(screen.queryByText(/Member since/)).not.toBeInTheDocument();
  });

  it("handleUpdate calls refreshUser", () => {
    render(<ProfilePage />);
    mockRefreshUser.mockClear();
    fireEvent.click(screen.getByTestId("trigger-update"));
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it("handleSuccess calls success toast", () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByTestId("trigger-success"));
    expect(mockSuccess).toHaveBeenCalledWith("Profile saved successfully.");
  });

  it("handleError calls error toast", () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByTestId("trigger-error"));
    expect(mockError).toHaveBeenCalledWith("test error");
  });
});
