import { render, screen, fireEvent } from "@testing-library/react";
import { ModerationControls } from "@/components/video/ModerationControls";

// Mock the moderation API functions
jest.mock("@/lib/api/moderation", () => ({
  getModerationQueue: jest.fn(),
  approveItem: jest.fn(),
  rejectItem: jest.fn(),
}));

describe("ModerationControls", () => {
  const defaultProps = {
    videoId: "video-123",
    onStatusChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Approve and Reject buttons", () => {
    render(<ModerationControls {...defaultProps} />);

    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("renders the Moderation heading", () => {
    render(<ModerationControls {...defaultProps} />);

    expect(screen.getByText("Moderation")).toBeInTheDocument();
  });

  it("shows the rejection reason textarea when Reject is clicked", () => {
    render(<ModerationControls {...defaultProps} />);

    // Initially no textarea
    expect(
      screen.queryByText("Rejection reason (min 10 characters)")
    ).not.toBeInTheDocument();

    // Click Reject
    fireEvent.click(screen.getByText("Reject"));

    // Now the rejection form appears
    expect(
      screen.getByText("Rejection reason (min 10 characters)")
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm Reject")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("hides the rejection form when Cancel is clicked", () => {
    render(<ModerationControls {...defaultProps} />);

    // Show the form
    fireEvent.click(screen.getByText("Reject"));
    expect(
      screen.getByText("Rejection reason (min 10 characters)")
    ).toBeInTheDocument();

    // Click Cancel
    fireEvent.click(screen.getByText("Cancel"));

    // Form should be hidden
    expect(
      screen.queryByText("Rejection reason (min 10 characters)")
    ).not.toBeInTheDocument();
  });

  it("shows validation error when rejection reason is too short", async () => {
    render(<ModerationControls {...defaultProps} />);

    // Show the form
    fireEvent.click(screen.getByText("Reject"));

    // Type a short reason
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "short" } });

    // Click Confirm Reject
    fireEvent.click(screen.getByText("Confirm Reject"));

    // Should show validation error
    expect(
      screen.getByText("Rejection reason must be at least 10 characters.")
    ).toBeInTheDocument();
  });
});
