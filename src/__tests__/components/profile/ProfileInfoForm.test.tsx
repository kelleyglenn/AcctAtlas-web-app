import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileInfoForm } from "@/components/profile/ProfileInfoForm";

jest.mock("@/lib/api/users", () => ({
  updateProfile: jest.fn(),
}));

import { updateProfile } from "@/lib/api/users";

const mockUser = {
  id: "1",
  email: "test@example.com",
  emailVerified: true,
  displayName: "TestUser",
  trustTier: "NEW" as const,
};

describe("ProfileInfoForm", () => {
  const onUpdate = jest.fn();
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders display name input with current value", () => {
    render(
      <ProfileInfoForm
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const input = screen.getByDisplayValue("TestUser");
    expect(input).toBeInTheDocument();
  });

  it("renders Save button", () => {
    render(
      <ProfileInfoForm
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("calls updateProfile and callbacks on save", async () => {
    const updatedUser = { ...mockUser, displayName: "NewName" };
    (updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    render(
      <ProfileInfoForm
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const input = screen.getByDisplayValue("TestUser");
    fireEvent.change(input, { target: { value: "NewName" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({ displayName: "NewName" });
      expect(onUpdate).toHaveBeenCalledWith(updatedUser);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when updateProfile fails", async () => {
    (updateProfile as jest.Mock).mockRejectedValue(new Error("fail"));

    render(
      <ProfileInfoForm
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Failed to update profile.");
    });
  });

  it("does not save when display name is too short", async () => {
    render(
      <ProfileInfoForm
        user={mockUser}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const input = screen.getByDisplayValue("TestUser");
    fireEvent.change(input, { target: { value: "X" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(updateProfile).not.toHaveBeenCalled();
    });
  });
});
