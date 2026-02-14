import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import {
  ToastContainer,
  useToasts,
  type ToastMessage,
} from "@/components/ui/Toast";

// Mock crypto.randomUUID for consistent test behavior
let uuidCounter = 0;
const originalCrypto = globalThis.crypto;
beforeAll(() => {
  uuidCounter = 0;
  Object.defineProperty(globalThis, "crypto", {
    value: {
      ...originalCrypto,
      randomUUID: () => `test-uuid-${++uuidCounter}`,
    },
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(globalThis, "crypto", {
    value: originalCrypto,
    writable: true,
  });
});

beforeEach(() => {
  uuidCounter = 0;
});

describe("ToastContainer", () => {
  const mockDismiss = jest.fn();

  beforeEach(() => {
    mockDismiss.mockClear();
  });

  it("should return null when toasts array is empty", () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={mockDismiss} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render toast messages", () => {
    const toasts: ToastMessage[] = [
      { id: "1", type: "success", message: "Operation successful" },
      { id: "2", type: "error", message: "Something went wrong" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockDismiss} />);

    expect(screen.getByText("Operation successful")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render success toast with green background", () => {
    const toasts: ToastMessage[] = [
      { id: "1", type: "success", message: "Success!" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockDismiss} />);

    const toastEl = screen.getByText("Success!").closest("div[class*='bg-']");
    expect(toastEl).toHaveClass("bg-green-600");
  });

  it("should render error toast with red background", () => {
    const toasts: ToastMessage[] = [
      { id: "1", type: "error", message: "Error!" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockDismiss} />);

    const toastEl = screen.getByText("Error!").closest("div[class*='bg-']");
    expect(toastEl).toHaveClass("bg-red-600");
  });

  it("should render info toast with blue background", () => {
    const toasts: ToastMessage[] = [
      { id: "1", type: "info", message: "Info!" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockDismiss} />);

    const toastEl = screen.getByText("Info!").closest("div[class*='bg-']");
    expect(toastEl).toHaveClass("bg-blue-600");
  });

  it("should have a dismiss button that triggers exit animation then onDismiss", () => {
    jest.useFakeTimers();

    const toasts: ToastMessage[] = [
      { id: "toast-1", type: "info", message: "Dismissable toast" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockDismiss} />);

    // Find the dismiss button (the button inside the toast)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    act(() => {
      fireEvent.click(buttons[0]);
    });

    // onDismiss is called after 300ms exit animation
    expect(mockDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockDismiss).toHaveBeenCalledWith("toast-1");

    jest.useRealTimers();
  });

  it("should auto-dismiss toast after 3000ms + 300ms exit animation", () => {
    jest.useFakeTimers();

    const toasts: ToastMessage[] = [
      { id: "toast-1", type: "success", message: "Auto dismiss" },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={mockDismiss} />);

    // Not dismissed yet
    expect(mockDismiss).not.toHaveBeenCalled();

    // Advance past the 3000ms auto-dismiss timer
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Still waiting for 300ms exit animation
    expect(mockDismiss).not.toHaveBeenCalled();

    // Advance past the 300ms exit animation
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockDismiss).toHaveBeenCalledWith("toast-1");

    jest.useRealTimers();
  });
});

describe("useToasts", () => {
  it("should have empty toasts array initially", () => {
    const { result } = renderHook(() => useToasts());

    expect(result.current.toasts).toEqual([]);
  });

  it("should add a toast with addToast", () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast("success", "Test message");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[0].message).toBe("Test message");
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it("should dismiss a toast by id", () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast("info", "To be dismissed");
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("should not affect other toasts when dismissing one", () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast("info", "First toast");
      result.current.addToast("error", "Second toast");
    });

    const firstToastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(firstToastId);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Second toast");
  });

  it("should add a success toast with success shortcut", () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.success("Success!");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[0].message).toBe("Success!");
  });

  it("should add an error toast with error shortcut", () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.error("Error!");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("error");
    expect(result.current.toasts[0].message).toBe("Error!");
  });

  it("should add an info toast with info shortcut", () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.info("Info!");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("info");
    expect(result.current.toasts[0].message).toBe("Info!");
  });
});
