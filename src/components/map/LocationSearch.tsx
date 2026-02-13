"use client";

import { useCallback, useState } from "react";
import { SearchBox } from "@mapbox/search-js-react";
import { useMap } from "@/providers/MapProvider";
import { MAPBOX_ACCESS_TOKEN } from "@/config/mapbox";

interface LocationSearchProps {
  onLocationSelect?: (name: string) => void;
}

// Type for the SearchBox onRetrieve response
interface SearchBoxFeature {
  geometry: {
    coordinates: number[];
  };
  properties: {
    name?: string;
    place_formatted?: string;
  };
}

interface SearchBoxResponse {
  features: SearchBoxFeature[];
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const { flyTo } = useMap();
  const [inputValue, setInputValue] = useState("");

  const handleRetrieve = useCallback(
    (res: SearchBoxResponse) => {
      if (res.features.length > 0) {
        const feature = res.features[0];
        const coords = feature.geometry.coordinates;
        const lng = coords[0];
        const lat = coords[1];
        const name =
          feature.properties.name ||
          feature.properties.place_formatted ||
          "Location";

        flyTo(lng, lat, 12);
        onLocationSelect?.(name);
        setInputValue("");
      }
    },
    [flyTo, onLocationSelect]
  );

  if (!MAPBOX_ACCESS_TOKEN) {
    return null;
  }

  return (
    <div className="relative">
      <SearchBox
        accessToken={MAPBOX_ACCESS_TOKEN}
        value={inputValue}
        onChange={setInputValue}
        onRetrieve={handleRetrieve as (res: unknown) => void}
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
  );
}
