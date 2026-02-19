"use client";

import Map from "react-map-gl/mapbox";
import {
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE,
  DEFAULT_VIEWPORT,
} from "@/config/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export function HeroMap() {
  return (
    <div className="w-full h-full cursor-default">
      <Map
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        mapStyle={MAPBOX_STYLE}
        initialViewState={DEFAULT_VIEWPORT}
        interactive={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
