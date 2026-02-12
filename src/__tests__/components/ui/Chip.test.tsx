import { render, screen, fireEvent } from "@testing-library/react";
import { Chip } from "@/components/ui/Chip";

describe("Chip", () => {
  it("should render children", () => {
    render(<Chip>Test Label</Chip>);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("should have default (unselected) styles", () => {
    render(<Chip>Test</Chip>);

    const chip = screen.getByText("Test");
    expect(chip).toHaveClass("bg-gray-100");
    expect(chip).toHaveClass("text-gray-700");
  });

  it("should have selected styles when selected", () => {
    render(<Chip selected>Test</Chip>);

    const chip = screen.getByText("Test");
    expect(chip).toHaveClass("bg-blue-600");
    expect(chip).toHaveClass("text-white");
  });

  it("should show close icon when selected and clickable", () => {
    render(
      <Chip selected onClick={() => {}}>
        Test
      </Chip>
    );

    // The SVG close icon should be rendered
    const chip = screen.getByText("Test").closest("span");
    expect(chip?.querySelector("svg")).toBeInTheDocument();
  });

  it("should not show close icon when not selected", () => {
    render(<Chip onClick={() => {}}>Test</Chip>);

    const chip = screen.getByText("Test").closest("span");
    expect(chip?.querySelector("svg")).not.toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Chip onClick={handleClick}>Test</Chip>);

    fireEvent.click(screen.getByText("Test"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick on Enter key", () => {
    const handleClick = jest.fn();
    render(<Chip onClick={handleClick}>Test</Chip>);

    fireEvent.keyDown(screen.getByText("Test"), { key: "Enter" });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick on Space key", () => {
    const handleClick = jest.fn();
    render(<Chip onClick={handleClick}>Test</Chip>);

    fireEvent.keyDown(screen.getByText("Test"), { key: " " });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick on other keys", () => {
    const handleClick = jest.fn();
    render(<Chip onClick={handleClick}>Test</Chip>);

    fireEvent.keyDown(screen.getByText("Test"), { key: "a" });

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should have cursor-pointer when clickable", () => {
    render(<Chip onClick={() => {}}>Test</Chip>);

    expect(screen.getByText("Test")).toHaveClass("cursor-pointer");
  });

  it("should not have cursor-pointer when not clickable", () => {
    render(<Chip>Test</Chip>);

    expect(screen.getByText("Test")).not.toHaveClass("cursor-pointer");
  });

  it("should have role=button when clickable", () => {
    render(<Chip onClick={() => {}}>Test</Chip>);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should have small size styles", () => {
    render(<Chip size="sm">Test</Chip>);

    const chip = screen.getByText("Test");
    expect(chip).toHaveClass("px-2");
    expect(chip).toHaveClass("py-0.5");
    expect(chip).toHaveClass("text-xs");
  });

  it("should have medium size styles by default", () => {
    render(<Chip>Test</Chip>);

    const chip = screen.getByText("Test");
    expect(chip).toHaveClass("px-3");
    expect(chip).toHaveClass("py-1");
    expect(chip).toHaveClass("text-sm");
  });

  it("should apply custom className", () => {
    render(<Chip className="custom-class">Test</Chip>);

    expect(screen.getByText("Test")).toHaveClass("custom-class");
  });
});
