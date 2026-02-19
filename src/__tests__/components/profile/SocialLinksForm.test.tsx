import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SocialLinksForm } from "@/components/profile/SocialLinksForm";

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

describe("SocialLinksForm", () => {
  const onUpdate = jest.fn();
  const onSuccess = jest.fn();
  const onError = jest.fn();
  const defaultLinks = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all six social link fields", () => {
    render(
      <SocialLinksForm
        socialLinks={defaultLinks}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByLabelText("YouTube")).toBeInTheDocument();
    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("TikTok")).toBeInTheDocument();
    expect(screen.getByLabelText("X (Twitter)")).toBeInTheDocument();
    expect(screen.getByLabelText("Bluesky")).toBeInTheDocument();
  });

  it("renders with existing social link values", () => {
    render(
      <SocialLinksForm
        socialLinks={{ youtube: "UCtest", instagram: "testaccount" }}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByDisplayValue("UCtest")).toBeInTheDocument();
    expect(screen.getByDisplayValue("testaccount")).toBeInTheDocument();
  });

  it("calls updateProfile with social links on save", async () => {
    (updateProfile as jest.Mock).mockResolvedValue(mockUser);

    render(
      <SocialLinksForm
        socialLinks={defaultLinks}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const youtubeInput = screen.getByLabelText("YouTube");
    fireEvent.change(youtubeInput, { target: { value: "UCnew" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          socialLinks: expect.objectContaining({ youtube: "UCnew" }),
        })
      );
      expect(onUpdate).toHaveBeenCalledWith(mockUser);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onError when save fails", async () => {
    (updateProfile as jest.Mock).mockRejectedValue(new Error("fail"));

    render(
      <SocialLinksForm
        socialLinks={defaultLinks}
        onUpdate={onUpdate}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Failed to update social links.");
    });
  });
});
