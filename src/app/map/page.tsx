"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { MapProvider } from "@/providers/MapProvider";

// Dynamic import MapContainer with SSR disabled
// Mapbox GL requires browser APIs (document, window) that aren't available during SSR
const MapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-3.5rem)] bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

function MapPageContent() {
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const zoom = searchParams.get("zoom");

  const parsedLat = lat ? parseFloat(lat) : NaN;
  const parsedLng = lng ? parseFloat(lng) : NaN;

  const initialViewport =
    Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
      ? {
          latitude: parsedLat,
          longitude: parsedLng,
          zoom: zoom ? parseInt(zoom, 10) : 14,
        }
      : undefined;

  return (
    <MapProvider initialViewport={initialViewport}>
      <MapContainer />
    </MapProvider>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-3.5rem)] bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
