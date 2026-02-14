import { renderHook, act } from "@testing-library/react";
import { useResponsive } from "@/hooks/useResponsive";

describe("useResponsive", () => {
  const originalInnerWidth = window.innerWidth;

  function setWindowWidth(width: number) {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
  }

  afterEach(() => {
    // Restore original window width
    setWindowWidth(originalInnerWidth);
  });

  it("should have isClient as false before effect runs (SSR-safe)", () => {
    setWindowWidth(1024);

    // Access the initial render result before effects run
    let initialIsClient: boolean | undefined;

    const { result } = renderHook(() => {
      const hookResult = useResponsive();
      if (initialIsClient === undefined) {
        initialIsClient = hookResult.isClient;
      }
      return hookResult;
    });

    // The initial render (before useEffect) should have isClient = false
    expect(initialIsClient).toBe(false);

    // After effects, isClient should be true
    expect(result.current.isClient).toBe(true);
  });

  it("should set isClient to true after mount", () => {
    setWindowWidth(1024);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isClient).toBe(true);
  });

  it("should report isMobile as true when window.innerWidth < 768", () => {
    setWindowWidth(500);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("should report isMobile as false when window.innerWidth >= 768", () => {
    setWindowWidth(1024);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it("should report isMobile as false at exactly 768px", () => {
    setWindowWidth(768);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it("should respond to resize events", () => {
    setWindowWidth(1024);

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);

    // Resize to mobile width
    act(() => {
      setWindowWidth(500);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);

    // Resize back to desktop width
    act(() => {
      setWindowWidth(1200);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it("should remove resize event listener on unmount", () => {
    setWindowWidth(1024);

    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useResponsive());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
