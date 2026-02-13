"use client";

import { Marker } from "react-map-gl/mapbox";
import { useMap } from "@/providers/MapProvider";
import { MARKER_COLORS, MARKER_SIZES } from "@/config/mapbox";
import type { VideoLocation } from "@/types/map";

interface VideoMarkerProps {
  video: VideoLocation;
  onClick?: (video: VideoLocation) => void;
}

export function VideoMarker({ video, onClick }: VideoMarkerProps) {
  const { selectedVideoId, highlightedVideoId, setSelectedVideoId } = useMap();

  // Safety check for valid coordinates
  if (
    typeof video.longitude !== "number" ||
    typeof video.latitude !== "number" ||
    isNaN(video.longitude) ||
    isNaN(video.latitude)
  ) {
    return null;
  }

  const isSelected = selectedVideoId === video.id;
  const isHighlighted = highlightedVideoId === video.id;

  const handleClick = () => {
    setSelectedVideoId(video.id);
    onClick?.(video);
  };

  // Determine marker color and size based on state
  const color = isSelected
    ? MARKER_COLORS.selected
    : isHighlighted
      ? MARKER_COLORS.highlighted
      : MARKER_COLORS.default;

  const size = isSelected ? MARKER_SIZES.selected : MARKER_SIZES.default;

  return (
    <Marker
      longitude={video.longitude}
      latitude={video.latitude}
      anchor="center"
    >
      <div
        data-video-id={video.id}
        data-testid="video-marker"
        className="cursor-pointer transition-transform hover:scale-110"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Video: ${video.title}`}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
          {/* Play icon inside */}
          <path d="M10 8L16 12L10 16V8Z" fill="white" />
        </svg>
      </div>
    </Marker>
  );
}
