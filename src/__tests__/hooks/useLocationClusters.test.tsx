import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocationClusters } from "@/hooks/useLocationClusters";
import * as searchApi from "@/lib/api/search";
import type { ReactNode } from "react";
import type { BoundingBox, ClusterResponse } from "@/types/map";

// Mock the search API
jest.mock("@/lib/api/search");
const mockSearchClusters = searchApi.searchClusters as jest.MockedFunction<
  typeof searchApi.searchClusters
>;

// Mock the mapbox config so clusterZoomThreshold is stable
jest.mock("@/config/mapbox", () => ({
  MAP_CONFIG: {
    clusterZoomThreshold: 8,
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function TestQueryProvider({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return TestQueryProvider;
};

const mockBounds: BoundingBox = [-123, 37, -122, 38];

const mockClusterResponse: ClusterResponse = {
  clusters: [
    {
      id: "cluster-1",
      latitude: 37.5,
      longitude: -122.5,
      count: 5,
    },
    {
      id: "cluster-2",
      latitude: 37.8,
      longitude: -122.3,
      count: 12,
    },
  ],
  zoom: 5,
};

describe("useLocationClusters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not fetch when bounds is null", () => {
    const wrapper = createWrapper();

    renderHook(
      () =>
        useLocationClusters({
          bounds: null,
          zoom: 5,
        }),
      { wrapper }
    );

    expect(mockSearchClusters).not.toHaveBeenCalled();
  });

  it("should not fetch when enabled is false", () => {
    const wrapper = createWrapper();

    renderHook(
      () =>
        useLocationClusters({
          bounds: mockBounds,
          zoom: 5,
          enabled: false,
        }),
      { wrapper }
    );

    expect(mockSearchClusters).not.toHaveBeenCalled();
  });

  it("should not fetch when zoom >= clusterZoomThreshold (8)", () => {
    const wrapper = createWrapper();

    renderHook(
      () =>
        useLocationClusters({
          bounds: mockBounds,
          zoom: 8,
        }),
      { wrapper }
    );

    expect(mockSearchClusters).not.toHaveBeenCalled();
  });

  it("should not fetch when zoom is above threshold", () => {
    const wrapper = createWrapper();

    renderHook(
      () =>
        useLocationClusters({
          bounds: mockBounds,
          zoom: 12,
        }),
      { wrapper }
    );

    expect(mockSearchClusters).not.toHaveBeenCalled();
  });

  it("should fetch when bounds provided and zoom < 8", async () => {
    mockSearchClusters.mockResolvedValueOnce(mockClusterResponse);
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useLocationClusters({
          bounds: mockBounds,
          zoom: 5,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSearchClusters).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockClusterResponse);
  });

  it("should include Math.floor(zoom) in the query key", async () => {
    mockSearchClusters.mockResolvedValue(mockClusterResponse);
    const wrapper = createWrapper();

    // First render with zoom 5.7
    const { result, rerender } = renderHook(
      ({ zoom }) =>
        useLocationClusters({
          bounds: mockBounds,
          zoom,
        }),
      {
        wrapper,
        initialProps: { zoom: 5.7 },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Rerender with zoom 5.3 - same Math.floor, should NOT refetch
    rerender({ zoom: 5.3 });

    // Still only one call because Math.floor(5.7) === Math.floor(5.3) === 5
    expect(mockSearchClusters).toHaveBeenCalledTimes(1);

    // Rerender with zoom 6.1 - different Math.floor, should refetch
    rerender({ zoom: 6.1 });

    await waitFor(() => {
      expect(mockSearchClusters).toHaveBeenCalledTimes(2);
    });
  });

  it("should pass correct params to searchClusters", async () => {
    mockSearchClusters.mockResolvedValueOnce(mockClusterResponse);
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useLocationClusters({
          bounds: mockBounds,
          zoom: 5.9,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSearchClusters).toHaveBeenCalledWith({
      bbox: mockBounds,
      zoom: 5, // Math.floor(5.9)
      amendments: undefined,
      participants: undefined,
    });
  });

  it("should pass filter params to searchClusters", async () => {
    mockSearchClusters.mockResolvedValueOnce(mockClusterResponse);
    const wrapper = createWrapper();

    const { result } = renderHook(
      () =>
        useLocationClusters({
          bounds: mockBounds,
          zoom: 5,
          filters: {
            amendments: ["FIRST", "FOURTH"],
            participants: ["POLICE"],
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSearchClusters).toHaveBeenCalledWith({
      bbox: mockBounds,
      zoom: 5,
      amendments: ["FIRST", "FOURTH"],
      participants: ["POLICE"],
    });
  });

  it("should refetch when filters change", async () => {
    mockSearchClusters.mockResolvedValue(mockClusterResponse);
    const wrapper = createWrapper();

    const { result, rerender } = renderHook(
      ({ filters }) =>
        useLocationClusters({
          bounds: mockBounds,
          zoom: 5,
          filters,
        }),
      {
        wrapper,
        initialProps: {
          filters: { amendments: [] as string[], participants: [] as string[] },
        },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSearchClusters).toHaveBeenCalledTimes(1);

    // Change filters - should trigger refetch
    rerender({
      filters: { amendments: ["FIRST"], participants: [] },
    });

    await waitFor(() => {
      expect(mockSearchClusters).toHaveBeenCalledTimes(2);
    });
  });
});
