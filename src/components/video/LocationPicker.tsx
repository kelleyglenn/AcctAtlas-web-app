"use client";

import { useState, useCallback, useRef } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE } from "@/config/mapbox";
import { reverseGeocode } from "@/lib/api/locations";
import type { ReverseGeocodeResponse } from "@/types/api";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationPickerProps {
  onLocationChange: (
    location: {
      latitude: number;
      longitude: number;
      geocode: ReverseGeocodeResponse;
    } | null
  ) => void;
  error?: string;
}

export function LocationPicker({
  onLocationChange,
  error,
}: LocationPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geocodeResult, setGeocodeResult] =
    useState<ReverseGeocodeResponse | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleMapClick = useCallback(
    async (e: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = e.lngLat;
      setMarker({ lat, lng });
      setIsGeocoding(true);
      setGeocodeResult(null);

      try {
        const result = await reverseGeocode(lat, lng);
        setGeocodeResult(result);
        onLocationChange({ latitude: lat, longitude: lng, geocode: result });
      } catch {
        setGeocodeResult(null);
        onLocationChange({
          latitude: lat,
          longitude: lng,
          geocode: {
            displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          },
        });
      } finally {
        setIsGeocoding(false);
      }
    },
    [onLocationChange]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Location <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Click the map to place a marker, or use the search box.
      </p>
      <div
        className="rounded-lg overflow-hidden border border-gray-300"
        style={{ height: 350 }}
      >
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={MAPBOX_STYLE}
          initialViewState={{
            longitude: -98.5795,
            latitude: 39.8283,
            zoom: 4,
          }}
          onClick={handleMapClick}
          cursor="crosshair"
        >
          {marker && (
            <Marker
              latitude={marker.lat}
              longitude={marker.lng}
              color="#EF4444"
            />
          )}
        </Map>
      </div>
      {isGeocoding && (
        <p className="text-sm text-gray-500 mt-2">Resolving address...</p>
      )}
      {geocodeResult && (
        <p className="text-sm text-gray-700 mt-2">
          {[geocodeResult.address, geocodeResult.city, geocodeResult.state]
            .filter(Boolean)
            .join(", ") || geocodeResult.displayName}
        </p>
      )}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
