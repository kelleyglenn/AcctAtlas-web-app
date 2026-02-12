import { render, screen, fireEvent } from "@testing-library/react";
import { AmendmentFilter } from "@/components/map/AmendmentFilter";
import { MapProvider } from "@/providers/MapProvider";
import { AMENDMENT_OPTIONS } from "@/types/map";

const renderWithProvider = (component: React.ReactNode) => {
  return render(<MapProvider>{component}</MapProvider>);
};

describe("AmendmentFilter", () => {
  it("should render all amendment options", () => {
    renderWithProvider(<AmendmentFilter />);

    AMENDMENT_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("should render amendments label", () => {
    renderWithProvider(<AmendmentFilter />);

    expect(screen.getByText("Amendments")).toBeInTheDocument();
  });

  it("should toggle amendment selection on click", () => {
    renderWithProvider(<AmendmentFilter />);

    const firstAmendment = screen.getByText("1st Amendment");

    // Initially not selected (gray background)
    expect(firstAmendment).toHaveClass("bg-gray-100");

    // Click to select
    fireEvent.click(firstAmendment);

    // Now selected (blue background)
    expect(firstAmendment).toHaveClass("bg-blue-600");

    // Click again to deselect
    fireEvent.click(firstAmendment);

    // Back to not selected
    expect(firstAmendment).toHaveClass("bg-gray-100");
  });

  it("should allow multiple amendments to be selected", () => {
    renderWithProvider(<AmendmentFilter />);

    const firstAmendment = screen.getByText("1st Amendment");
    const fourthAmendment = screen.getByText("4th Amendment");

    fireEvent.click(firstAmendment);
    fireEvent.click(fourthAmendment);

    expect(firstAmendment).toHaveClass("bg-blue-600");
    expect(fourthAmendment).toHaveClass("bg-blue-600");
  });

  it("should handle keyboard navigation", () => {
    renderWithProvider(<AmendmentFilter />);

    const firstAmendment = screen.getByText("1st Amendment");

    // Initially not selected
    expect(firstAmendment).toHaveClass("bg-gray-100");

    // Press Enter to select
    fireEvent.keyDown(firstAmendment, { key: "Enter" });

    // Now selected
    expect(firstAmendment).toHaveClass("bg-blue-600");

    // Press Space to deselect
    fireEvent.keyDown(firstAmendment, { key: " " });

    // Back to not selected
    expect(firstAmendment).toHaveClass("bg-gray-100");
  });
});
