"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import { SearchBox } from "@mapbox/search-js-react";
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
  const [searchValue, setSearchValue] = useState("");

  const onLocationChangeRef = useRef(onLocationChange);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const placeMarker = useCallback(async (lat: number, lng: number) => {
    setMarker({ lat, lng });
    setIsGeocoding(true);
    setGeocodeResult(null);

    try {
      const result = await reverseGeocode(lat, lng);
      setGeocodeResult(result);
      onLocationChangeRef.current({
        latitude: lat,
        longitude: lng,
        geocode: result,
      });
    } catch {
      setGeocodeResult(null);
      onLocationChangeRef.current({
        latitude: lat,
        longitude: lng,
        geocode: {
          displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        },
      });
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleSearchRetrieve = useCallback(
    (res: { features: { geometry: { coordinates: number[] } }[] }) => {
      if (res.features.length > 0) {
        const coords = res.features[0].geometry.coordinates;
        const lng = coords[0];
        const lat = coords[1];
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 });
        placeMarker(lat, lng);
        setSearchValue("");
      }
    },
    [placeMarker]
  );

  const handleMapClick = useCallback(
    (e: { lngLat: { lng: number; lat: number } }) => {
      placeMarker(e.lngLat.lat, e.lngLat.lng);
    },
    [placeMarker]
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
        className="relative rounded-lg overflow-hidden border border-gray-300"
        style={{ height: 350 }}
      >
        {MAPBOX_ACCESS_TOKEN && (
          <div className="absolute top-2 left-2 right-2 z-10">
            <SearchBox
              accessToken={MAPBOX_ACCESS_TOKEN}
              value={searchValue}
              onChange={setSearchValue}
              onRetrieve={handleSearchRetrieve as (res: unknown) => void}
              placeholder="Search for a location..."
              options={{
                country: "US",
                types: "place,postcode,address,poi",
              }}
              theme={{
                variables: {
                  fontFamily: "inherit",
                  unit: "14px",
                  padding: "0.5em",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                },
              }}
            />
          </div>
        )}
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
