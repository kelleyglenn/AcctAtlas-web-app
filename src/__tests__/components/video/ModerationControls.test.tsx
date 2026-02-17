import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModerationControls } from "@/components/video/ModerationControls";
import {
  getModerationItemByContentId,
  approveItem,
  rejectItem,
} from "@/lib/api/moderation";

// Mock the moderation API functions
jest.mock("@/lib/api/moderation", () => ({
  getModerationItemByContentId: jest.fn(),
  approveItem: jest.fn(),
  rejectItem: jest.fn(),
}));

const mockGetModerationItemByContentId =
  getModerationItemByContentId as jest.Mock;
const mockApproveItem = approveItem as jest.Mock;
const mockRejectItem = rejectItem as jest.Mock;

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

    expect(
      screen.queryByText("Rejection reason (min 10 characters)")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Reject"));

    expect(
      screen.getByText("Rejection reason (min 10 characters)")
    ).toBeInTheDocument();
    expect(screen.getByText("Confirm Reject")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("hides the rejection form when Cancel is clicked", () => {
    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Reject"));
    expect(
      screen.getByText("Rejection reason (min 10 characters)")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    expect(
      screen.queryByText("Rejection reason (min 10 characters)")
    ).not.toBeInTheDocument();
  });

  it("shows validation error when rejection reason is too short", () => {
    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Reject"));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "short" } });

    fireEvent.click(screen.getByText("Confirm Reject"));

    expect(
      screen.getByText("Rejection reason must be at least 10 characters.")
    ).toBeInTheDocument();
  });

  it("approves successfully when moderation item is found", async () => {
    mockGetModerationItemByContentId.mockResolvedValue({ id: "mod-1" });
    mockApproveItem.mockResolvedValue({});

    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Approve"));

    await waitFor(() => {
      expect(mockGetModerationItemByContentId).toHaveBeenCalledWith(
        "video-123"
      );
      expect(mockApproveItem).toHaveBeenCalledWith("mod-1");
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith("APPROVED");
    });
  });

  it("shows error when approving and moderation item is not found", async () => {
    mockGetModerationItemByContentId.mockResolvedValue(null);

    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Approve"));

    await waitFor(() => {
      expect(
        screen.getByText("Moderation item not found.")
      ).toBeInTheDocument();
    });
    expect(mockApproveItem).not.toHaveBeenCalled();
    expect(defaultProps.onStatusChange).not.toHaveBeenCalled();
  });

  it("shows error when approve API call fails", async () => {
    mockGetModerationItemByContentId.mockResolvedValue({ id: "mod-1" });
    mockApproveItem.mockRejectedValue(new Error("Network error"));

    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Approve"));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to approve. Please try again.")
      ).toBeInTheDocument();
    });
    expect(defaultProps.onStatusChange).not.toHaveBeenCalled();
  });

  it("rejects successfully when moderation item is found", async () => {
    mockGetModerationItemByContentId.mockResolvedValue({ id: "mod-1" });
    mockRejectItem.mockResolvedValue({});

    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Reject"));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: "This video violates guidelines" },
    });

    fireEvent.click(screen.getByText("Confirm Reject"));

    await waitFor(() => {
      expect(mockGetModerationItemByContentId).toHaveBeenCalledWith(
        "video-123"
      );
      expect(mockRejectItem).toHaveBeenCalledWith(
        "mod-1",
        "This video violates guidelines"
      );
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith("REJECTED");
    });

    expect(
      screen.queryByText("Rejection reason (min 10 characters)")
    ).not.toBeInTheDocument();
  });

  it("shows error when rejecting and moderation item is not found", async () => {
    mockGetModerationItemByContentId.mockResolvedValue(null);

    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Reject"));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: "This video violates guidelines" },
    });

    fireEvent.click(screen.getByText("Confirm Reject"));

    await waitFor(() => {
      expect(
        screen.getByText("Moderation item not found.")
      ).toBeInTheDocument();
    });
    expect(mockRejectItem).not.toHaveBeenCalled();
    expect(defaultProps.onStatusChange).not.toHaveBeenCalled();
  });

  it("shows error when reject API call fails", async () => {
    mockGetModerationItemByContentId.mockResolvedValue({ id: "mod-1" });
    mockRejectItem.mockRejectedValue(new Error("Network error"));

    render(<ModerationControls {...defaultProps} />);

    fireEvent.click(screen.getByText("Reject"));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: "This video violates guidelines" },
    });

    fireEvent.click(screen.getByText("Confirm Reject"));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to reject. Please try again.")
      ).toBeInTheDocument();
    });
    expect(defaultProps.onStatusChange).not.toHaveBeenCalled();
  });
});
