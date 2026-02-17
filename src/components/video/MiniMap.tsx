"use client";

import Map, { Marker } from "react-map-gl/mapbox";
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE } from "@/config/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface MiniMapProps {
  latitude: number;
  longitude: number;
}

export function MiniMap({ latitude, longitude }: MiniMapProps) {
  return (
    <div
      data-testid="mini-map"
      className="rounded-lg overflow-hidden border border-gray-200"
      style={{ height: 250 }}
    >
      <Map
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        mapStyle={MAPBOX_STYLE}
        initialViewState={{ latitude, longitude, zoom: 13 }}
        interactive={true}
      >
        <Marker latitude={latitude} longitude={longitude} color="#EF4444" />
      </Map>
    </div>
  );
}
