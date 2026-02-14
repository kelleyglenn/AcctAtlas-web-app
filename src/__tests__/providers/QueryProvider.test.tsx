import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { QueryProvider } from "@/providers/QueryProvider";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryProvider>{children}</QueryProvider>
);

describe("QueryProvider", () => {
  it("should render children correctly", () => {
    render(
      <QueryProvider>
        <div data-testid="child-element">Hello World</div>
      </QueryProvider>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should provide QueryClient context", () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.getDefaultOptions().queries?.staleTime).toBe(60000);
    expect(result.current.getDefaultOptions().queries?.retry).toBe(1);
  });
});
