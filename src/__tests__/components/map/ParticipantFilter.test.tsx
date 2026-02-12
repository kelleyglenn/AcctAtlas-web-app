import { render, screen, fireEvent } from "@testing-library/react";
import { ParticipantFilter } from "@/components/map/ParticipantFilter";
import { MapProvider } from "@/providers/MapProvider";
import { PARTICIPANT_TYPE_OPTIONS } from "@/types/map";

const renderWithProvider = (component: React.ReactNode) => {
  return render(<MapProvider>{component}</MapProvider>);
};

describe("ParticipantFilter", () => {
  it("should render all participant type options", () => {
    renderWithProvider(<ParticipantFilter />);

    PARTICIPANT_TYPE_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("should render participants label", () => {
    renderWithProvider(<ParticipantFilter />);

    expect(screen.getByText("Participants")).toBeInTheDocument();
  });

  it("should toggle participant selection on click", () => {
    renderWithProvider(<ParticipantFilter />);

    const policeOption = screen.getByText("Police");

    // Initially not selected
    expect(policeOption).toHaveClass("bg-gray-100");

    // Click to select
    fireEvent.click(policeOption);

    // Now selected
    expect(policeOption).toHaveClass("bg-blue-600");

    // Click again to deselect
    fireEvent.click(policeOption);

    // Back to not selected
    expect(policeOption).toHaveClass("bg-gray-100");
  });

  it("should allow multiple participants to be selected", () => {
    renderWithProvider(<ParticipantFilter />);

    const policeOption = screen.getByText("Police");
    const securityOption = screen.getByText("Security");

    fireEvent.click(policeOption);
    fireEvent.click(securityOption);

    expect(policeOption).toHaveClass("bg-blue-600");
    expect(securityOption).toHaveClass("bg-blue-600");
  });
});
