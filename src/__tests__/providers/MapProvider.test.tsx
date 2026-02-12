import { renderHook, act } from "@testing-library/react";
import { MapProvider, useMap } from "@/providers/MapProvider";
import { DEFAULT_VIEWPORT } from "@/config/mapbox";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MapProvider>{children}</MapProvider>
);

describe("MapProvider", () => {
  describe("initial state", () => {
    it("should have default viewport", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      expect(result.current.viewport).toEqual(DEFAULT_VIEWPORT);
    });

    it("should have null bounds initially", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      expect(result.current.bounds).toBeNull();
    });

    it("should have empty filters initially", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      expect(result.current.filters).toEqual({
        amendments: [],
        participants: [],
        dateFrom: undefined,
        dateTo: undefined,
      });
    });

    it("should have no selected video initially", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      expect(result.current.selectedVideoId).toBeNull();
    });

    it("should have no highlighted video initially", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      expect(result.current.highlightedVideoId).toBeNull();
    });
  });

  describe("viewport management", () => {
    it("should update viewport", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      const newViewport = { longitude: -122.4, latitude: 37.8, zoom: 12 };

      act(() => {
        result.current.setViewport(newViewport);
      });

      expect(result.current.viewport).toEqual(newViewport);
    });
  });

  describe("bounds management", () => {
    it("should update bounds", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      const newBounds: [number, number, number, number] = [-123, 37, -122, 38];

      act(() => {
        result.current.setBounds(newBounds);
      });

      expect(result.current.bounds).toEqual(newBounds);
    });
  });

  describe("video selection", () => {
    it("should select a video", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.setSelectedVideoId("video-123");
      });

      expect(result.current.selectedVideoId).toBe("video-123");
    });

    it("should deselect a video", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.setSelectedVideoId("video-123");
      });

      act(() => {
        result.current.setSelectedVideoId(null);
      });

      expect(result.current.selectedVideoId).toBeNull();
    });
  });

  describe("video highlighting", () => {
    it("should highlight a video", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.setHighlightedVideoId("video-456");
      });

      expect(result.current.highlightedVideoId).toBe("video-456");
    });

    it("should unhighlight a video", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.setHighlightedVideoId("video-456");
      });

      act(() => {
        result.current.setHighlightedVideoId(null);
      });

      expect(result.current.highlightedVideoId).toBeNull();
    });
  });

  describe("filter management", () => {
    it("should update filters with updateFilters", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.updateFilters({ amendments: ["1", "4"] });
      });

      expect(result.current.filters.amendments).toEqual(["1", "4"]);
      expect(result.current.filters.participants).toEqual([]);
    });

    it("should merge filters without overwriting other fields", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.updateFilters({ amendments: ["1"] });
      });

      act(() => {
        result.current.updateFilters({ participants: ["police"] });
      });

      expect(result.current.filters.amendments).toEqual(["1"]);
      expect(result.current.filters.participants).toEqual(["police"]);
    });

    it("should replace filters with setFilters", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.updateFilters({ amendments: ["1"] });
      });

      act(() => {
        result.current.setFilters({
          amendments: ["4"],
          participants: ["security"],
          dateFrom: "2024-01-01",
          dateTo: undefined,
        });
      });

      expect(result.current.filters).toEqual({
        amendments: ["4"],
        participants: ["security"],
        dateFrom: "2024-01-01",
        dateTo: undefined,
      });
    });

    it("should clear all filters", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.updateFilters({
          amendments: ["1", "4"],
          participants: ["police"],
          dateFrom: "2024-01-01",
        });
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        amendments: [],
        participants: [],
        dateFrom: undefined,
        dateTo: undefined,
      });
    });
  });

  describe("flyTo functionality", () => {
    it("should set pending flyTo", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.flyTo(-122.4, 37.8, 14);
      });

      expect(result.current.pendingFlyTo).toEqual({
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14,
      });
    });

    it("should set pending flyTo without zoom", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.flyTo(-122.4, 37.8);
      });

      expect(result.current.pendingFlyTo).toEqual({
        longitude: -122.4,
        latitude: 37.8,
        zoom: undefined,
      });
    });

    it("should clear pending flyTo", () => {
      const { result } = renderHook(() => useMap(), { wrapper });

      act(() => {
        result.current.flyTo(-122.4, 37.8, 14);
      });

      act(() => {
        result.current.clearPendingFlyTo();
      });

      expect(result.current.pendingFlyTo).toBeNull();
    });
  });

  describe("useMap hook outside provider", () => {
    it("should throw error when used outside MapProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useMap());
      }).toThrow("useMap must be used within a MapProvider");

      consoleSpy.mockRestore();
    });
  });
});
