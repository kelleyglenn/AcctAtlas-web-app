"use client";

import dynamic from "next/dynamic";
import { MapProvider } from "@/providers/MapProvider";

// Dynamic import MapContainer with SSR disabled
// Mapbox GL requires browser APIs (document, window) that aren't available during SSR
const MapContainer = dynamic(
  () =>
    import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <MapProvider>
      <MapContainer />
    </MapProvider>
  );
}
