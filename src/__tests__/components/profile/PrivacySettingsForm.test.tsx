import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PrivacySettingsForm } from "@/components/profile/PrivacySettingsForm";

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

describe("PrivacySettingsForm", () => {
  const onUpdate = jest.fn();
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders both privacy checkboxes", () => {
    render(
      <PrivacySettingsForm
        privacySettings={{
          socialLinksVisibility: "REGISTERED",
          submissionsVisibility: "PUBLIC",
        }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(
      screen.getByText("Social links visible to everyone")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Submissions visible to everyone")
    ).toBeInTheDocument();
  });

  it("social links checkbox is unchecked when REGISTERED", () => {
    render(
      <PrivacySettingsForm
        privacySettings={{
          socialLinksVisibility: "REGISTERED",
          submissionsVisibility: "PUBLIC",
        }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it("toggling social links calls updateProfile with PUBLIC", async () => {
    (updateProfile as jest.Mock).mockResolvedValue(mockUser);

    render(
      <PrivacySettingsForm
        privacySettings={{
          socialLinksVisibility: "REGISTERED",
          submissionsVisibility: "PUBLIC",
        }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        privacySettings: {
          socialLinksVisibility: "PUBLIC",
          submissionsVisibility: "PUBLIC",
        },
      });
      expect(onUpdate).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when toggle fails", async () => {
    (updateProfile as jest.Mock).mockRejectedValue(new Error("fail"));

    render(
      <PrivacySettingsForm
        privacySettings={{
          socialLinksVisibility: "REGISTERED",
          submissionsVisibility: "PUBLIC",
        }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "Failed to update privacy settings."
      );
    });
  });
});
