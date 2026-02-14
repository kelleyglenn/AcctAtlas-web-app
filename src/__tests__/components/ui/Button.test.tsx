import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("should render children text", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should have primary variant styles by default", () => {
    render(<Button>Primary</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("should have secondary variant styles", () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-600");
  });

  it("should have outline variant styles", () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("border-gray-300");
  });

  it("should show 'Loading...' text when isLoading is true", () => {
    render(<Button isLoading>Submit</Button>);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  it("should disable the button when isLoading is true", () => {
    render(<Button isLoading>Submit</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should disable the button when disabled prop is true", () => {
    render(<Button disabled>Submit</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should not be disabled by default", () => {
    render(<Button>Submit</Button>);

    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("should pass additional className", () => {
    render(<Button className="extra-class">Test</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("extra-class");
  });

  it("should pass additional button props like onClick", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should pass type prop", () => {
    render(<Button type="submit">Submit</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("should render spinner SVG when loading", () => {
    render(<Button isLoading>Submit</Button>);

    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
  });
});
