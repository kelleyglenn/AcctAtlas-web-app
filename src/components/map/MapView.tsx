"use client";

import { useCallback, useRef, useEffect } from "react";
import Map, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import { useMap } from "@/providers/MapProvider";
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE, MAP_CONFIG } from "@/config/mapbox";
import type { BoundingBox } from "@/types/map";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
  children?: React.ReactNode;
}

export function MapView({ children }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const {
    viewport,
    setViewport,
    setBounds,
    pendingFlyTo,
    clearPendingFlyTo,
    pendingFitBounds,
    clearPendingFitBounds,
  } = useMap();

  // Update bounds when map moves
  const updateBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const mapBounds = map.getBounds();
    if (!mapBounds) return;

    const newBounds: BoundingBox = [
      mapBounds.getWest(),
      mapBounds.getSouth(),
      mapBounds.getEast(),
      mapBounds.getNorth(),
    ];
    setBounds(newBounds);
  }, [setBounds]);

  // Handle view state changes (pan, zoom)
  const handleMove = useCallback(
    (event: ViewStateChangeEvent) => {
      setViewport({
        longitude: event.viewState.longitude,
        latitude: event.viewState.latitude,
        zoom: event.viewState.zoom,
      });
    },
    [setViewport]
  );

  // Handle map load
  const handleLoad = useCallback(() => {
    updateBounds();
  }, [updateBounds]);

  // Handle move end (debounced bounds update)
  const handleMoveEnd = useCallback(() => {
    updateBounds();
  }, [updateBounds]);

  // Handle pending fly-to requests
  useEffect(() => {
    if (!pendingFlyTo || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [pendingFlyTo.longitude, pendingFlyTo.latitude],
      zoom: pendingFlyTo.zoom ?? viewport.zoom,
      duration: MAP_CONFIG.flyToDurationMs,
    });

    clearPendingFlyTo();
  }, [pendingFlyTo, clearPendingFlyTo, viewport.zoom]);

  // Handle pending fit-bounds requests
  useEffect(() => {
    if (!pendingFitBounds || !mapRef.current) return;

    mapRef.current.fitBounds(pendingFitBounds, {
      padding: 50,
      duration: MAP_CONFIG.flyToDurationMs,
    });

    clearPendingFitBounds();
  }, [pendingFitBounds, clearPendingFitBounds]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">
            Mapbox token not configured
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      mapStyle={MAPBOX_STYLE}
      longitude={viewport.longitude}
      latitude={viewport.latitude}
      zoom={viewport.zoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      onMove={handleMove}
      onMoveEnd={handleMoveEnd}
      onLoad={handleLoad}
      style={{ width: "100%", height: "100%" }}
      attributionControl={true}
    >
      {children}
    </Map>
  );
}
