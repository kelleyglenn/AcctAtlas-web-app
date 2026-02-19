import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AvatarPicker } from "@/components/profile/AvatarPicker";

// jsdom doesn't implement HTMLDialogElement.showModal/close
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

jest.mock("@/lib/api/users", () => ({
  updateProfile: jest.fn(),
}));

import { updateProfile } from "@/lib/api/users";

const mockUser = {
  id: "1",
  email: "test@example.com",
  emailVerified: true,
  displayName: "Test User",
  trustTier: "NEW" as const,
  avatarUrl: undefined as string | undefined,
};

describe("AvatarPicker", () => {
  const onUpdate = jest.fn();
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initials when no avatar URL", () => {
    render(
      <AvatarPicker
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByTestId("profile-avatar-placeholder")).toHaveTextContent(
      "TU"
    );
  });

  it("renders avatar image when avatarUrl exists", () => {
    render(
      <AvatarPicker
        user={{ ...mockUser, avatarUrl: "https://example.com/avatar.jpg" }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByTestId("profile-avatar")).toBeInTheDocument();
  });

  it("renders Change Avatar button", () => {
    render(
      <AvatarPicker
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByTestId("change-avatar-button")).toBeInTheDocument();
  });

  it("opens modal when Change Avatar is clicked", () => {
    render(
      <AvatarPicker
        user={mockUser}
        avatarSources={{ gravatar: "https://gravatar.com/avatar/abc" }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByTestId("change-avatar-button"));
    expect(screen.getByTestId("avatar-picker-modal")).toBeInTheDocument();
    expect(screen.getByText("Choose Avatar")).toBeInTheDocument();
  });

  it("shows no sources message when no avatar sources", () => {
    render(
      <AvatarPicker
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByTestId("change-avatar-button"));
    expect(
      screen.getByText("No avatar sources available.")
    ).toBeInTheDocument();
  });

  it("shows Gravatar source when available", () => {
    render(
      <AvatarPicker
        user={mockUser}
        avatarSources={{ gravatar: "https://gravatar.com/avatar/abc" }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByTestId("change-avatar-button"));
    expect(screen.getByTestId("avatar-source-gravatar")).toBeInTheDocument();
  });

  it("shows YouTube source when available", () => {
    render(
      <AvatarPicker
        user={mockUser}
        avatarSources={{
          gravatar: "https://gravatar.com/avatar/abc",
          youtube: "https://yt3.ggpht.com/thumb.jpg",
        }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByTestId("change-avatar-button"));
    expect(screen.getByTestId("avatar-source-youtube")).toBeInTheDocument();
  });

  it("selects avatar source and calls updateProfile", async () => {
    const updatedUser = {
      ...mockUser,
      avatarUrl: "https://gravatar.com/avatar/abc",
    };
    (updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    render(
      <AvatarPicker
        user={mockUser}
        avatarSources={{ gravatar: "https://gravatar.com/avatar/abc" }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByTestId("change-avatar-button"));
    fireEvent.click(screen.getByTestId("avatar-source-gravatar"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        avatarUrl: "https://gravatar.com/avatar/abc",
      });
      expect(onUpdate).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when avatar selection fails", async () => {
    (updateProfile as jest.Mock).mockRejectedValue(new Error("fail"));

    render(
      <AvatarPicker
        user={mockUser}
        avatarSources={{ gravatar: "https://gravatar.com/avatar/abc" }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByTestId("change-avatar-button"));
    fireEvent.click(screen.getByTestId("avatar-source-gravatar"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Failed to update avatar.");
    });
  });

  it("closes modal when Cancel is clicked", () => {
    render(
      <AvatarPicker
        user={mockUser}
        avatarSources={{ gravatar: "https://gravatar.com/avatar/abc" }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByTestId("change-avatar-button"));
    expect(screen.getByTestId("avatar-picker-modal")).toHaveAttribute("open");

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByTestId("avatar-picker-modal")).not.toHaveAttribute(
      "open"
    );
  });
});
