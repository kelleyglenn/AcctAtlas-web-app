import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useVideoSearch } from "@/hooks/useVideoSearch";
import * as searchApi from "@/lib/api/search";
import type { ReactNode } from "react";
import type { BoundingBox, MapFilters, SearchResponse } from "@/types/map";

// Mock the search API
jest.mock("@/lib/api/search");
const mockSearchVideos = searchApi.searchVideos as jest.MockedFunction<
  typeof searchApi.searchVideos
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockBounds: BoundingBox = [-123, 37, -122, 38];

const mockFilters: MapFilters = {
  amendments: [],
  participants: [],
  dateFrom: undefined,
  dateTo: undefined,
};

const mockSearchResponse: SearchResponse = {
  videos: [
    {
      id: "loc-1",
      videoId: "video-1",
      latitude: 37.5,
      longitude: -122.5,
      title: "Test Video 1",
      amendments: ["1"],
    },
    {
      id: "loc-2",
      videoId: "video-2",
      latitude: 37.6,
      longitude: -122.6,
      title: "Test Video 2",
      amendments: ["4"],
    },
  ],
  total: 2,
  page: 1,
  pageSize: 50,
};

describe("useVideoSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not fetch when bounds is null", () => {
    const wrapper = createWrapper();

    renderHook(
      () =>
        useVideoSearch({
          bounds: null,
          filters: mockFilters,
        }),
      { wrapper }
    );

    expect(mockSearchVideos).not.toHaveBeenCalled();
  });

  it("should not fetch when disabled", () => {
    const wrapper = createWrapper();

    renderHook(
      () =>
        useVideoSearch({
          bounds: mockBounds,
          filters: mockFilters,
          enabled: false,
        }),
      { wrapper }
    );

    expect(mockSearchVideos).not.toHaveBeenCalled();
  });

  it("should fetch when bounds is provided", async () => {
    mockSearchVideos.mockResolvedValueOnce(mockSearchResponse);
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useVideoSearch({
          bounds: mockBounds,
          filters: mockFilters,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSearchVideos).toHaveBeenCalledWith(
      expect.objectContaining({
        bbox: mockBounds,
        amendments: [],
        participants: [],
      })
    );
    expect(result.current.data).toEqual(mockSearchResponse);
  });

  it("should pass filters to API", async () => {
    mockSearchVideos.mockResolvedValueOnce(mockSearchResponse);
    const wrapper = createWrapper();

    const filtersWithValues: MapFilters = {
      amendments: ["1", "4"],
      participants: ["police"],
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    };

    renderHook(
      () =>
        useVideoSearch({
          bounds: mockBounds,
          filters: filtersWithValues,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockSearchVideos).toHaveBeenCalled();
    });

    expect(mockSearchVideos).toHaveBeenCalledWith(
      expect.objectContaining({
        bbox: mockBounds,
        amendments: ["1", "4"],
        participants: ["police"],
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      })
    );
  });

  it("should return loading state initially", () => {
    mockSearchVideos.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useVideoSearch({
          bounds: mockBounds,
          filters: mockFilters,
        }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    mockSearchVideos.mockRejectedValueOnce(error);
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useVideoSearch({
          bounds: mockBounds,
          filters: mockFilters,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("should refetch when bounds change", async () => {
    mockSearchVideos.mockResolvedValue(mockSearchResponse);
    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ bounds }) =>
        useVideoSearch({
          bounds,
          filters: mockFilters,
        }),
      {
        wrapper,
        initialProps: { bounds: mockBounds },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const newBounds: BoundingBox = [-124, 36, -121, 39];

    rerender({ bounds: newBounds });

    await waitFor(() => {
      expect(mockSearchVideos).toHaveBeenCalledTimes(2);
    });

    expect(mockSearchVideos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        bbox: newBounds,
      })
    );
  });

  it("should refetch when filters change", async () => {
    mockSearchVideos.mockResolvedValue(mockSearchResponse);
    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ filters }) =>
        useVideoSearch({
          bounds: mockBounds,
          filters,
        }),
      {
        wrapper,
        initialProps: { filters: mockFilters },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const newFilters: MapFilters = {
      ...mockFilters,
      amendments: ["1"],
    };

    rerender({ filters: newFilters });

    await waitFor(() => {
      expect(mockSearchVideos).toHaveBeenCalledTimes(2);
    });

    expect(mockSearchVideos).toHaveBeenLastCalledWith(
      expect.objectContaining({
        amendments: ["1"],
      })
    );
  });
});
