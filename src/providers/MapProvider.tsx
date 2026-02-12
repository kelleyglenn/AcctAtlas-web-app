"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { MapViewport, MapFilters, BoundingBox } from "@/types/map";
import { DEFAULT_VIEWPORT } from "@/config/mapbox";

interface MapContextType {
  // Viewport state
  viewport: MapViewport;
  setViewport: (viewport: MapViewport) => void;

  // Bounding box for current view
  bounds: BoundingBox | null;
  setBounds: (bounds: BoundingBox | null) => void;

  // Video selection
  selectedVideoId: string | null;
  setSelectedVideoId: (id: string | null) => void;

  // Video highlighting (hover)
  highlightedVideoId: string | null;
  setHighlightedVideoId: (id: string | null) => void;

  // Filter state
  filters: MapFilters;
  setFilters: (filters: MapFilters) => void;
  updateFilters: (updates: Partial<MapFilters>) => void;
  clearFilters: () => void;

  // Fly to a location
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
  pendingFlyTo: { longitude: number; latitude: number; zoom?: number } | null;
  clearPendingFlyTo: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

interface MapProviderProps {
  children: ReactNode;
}

const INITIAL_FILTERS: MapFilters = {
  amendments: [],
  participants: [],
  dateFrom: undefined,
  dateTo: undefined,
};

export function MapProvider({ children }: MapProviderProps) {
  const [viewport, setViewport] = useState<MapViewport>(DEFAULT_VIEWPORT);
  const [bounds, setBounds] = useState<BoundingBox | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [highlightedVideoId, setHighlightedVideoId] = useState<string | null>(
    null
  );
  const [filters, setFilters] = useState<MapFilters>(INITIAL_FILTERS);
  const [pendingFlyTo, setPendingFlyTo] = useState<{
    longitude: number;
    latitude: number;
    zoom?: number;
  } | null>(null);

  const updateFilters = useCallback((updates: Partial<MapFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const flyTo = useCallback(
    (longitude: number, latitude: number, zoom?: number) => {
      setPendingFlyTo({ longitude, latitude, zoom });
    },
    []
  );

  const clearPendingFlyTo = useCallback(() => {
    setPendingFlyTo(null);
  }, []);

  const value: MapContextType = {
    viewport,
    setViewport,
    bounds,
    setBounds,
    selectedVideoId,
    setSelectedVideoId,
    highlightedVideoId,
    setHighlightedVideoId,
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    flyTo,
    pendingFlyTo,
    clearPendingFlyTo,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}
