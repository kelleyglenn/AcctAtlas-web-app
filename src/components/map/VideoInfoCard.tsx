"use client";

import { Popup } from "react-map-gl/mapbox";
import { useMap } from "@/providers/MapProvider";
import {
  formatAmendment,
  formatParticipant,
  type VideoLocation,
} from "@/types/map";

interface VideoInfoCardProps {
  video: VideoLocation;
  onClose?: () => void;
}

export function VideoInfoCard({ video, onClose }: VideoInfoCardProps) {
  const { setSelectedVideoId } = useMap();

  // Safety check for valid coordinates
  if (
    typeof video.longitude !== "number" ||
    typeof video.latitude !== "number" ||
    isNaN(video.longitude) ||
    isNaN(video.latitude)
  ) {
    return null;
  }

  const handleClose = () => {
    setSelectedVideoId(null);
    onClose?.();
  };

  // Format duration as mm:ss
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const closeButton = (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }}
      className="absolute top-1 right-1 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
      aria-label="Close popup"
    >
      <svg
        className="w-4 h-4 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );

  return (
    <Popup
      longitude={video.longitude}
      latitude={video.latitude}
      anchor="bottom"
      onClose={handleClose}
      closeOnClick={true}
      className="video-info-popup"
      maxWidth="300px"
    >
      <div className="p-1">
        {/* Thumbnail with custom close button overlay */}
        {video.thumbnailUrl ? (
          <a
            href={`/videos/${video.videoId}`}
            className="relative mb-2 rounded overflow-hidden block"
          >
            {closeButton}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full aspect-video"
            />
            {video.duration && (
              <span className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </span>
            )}
          </a>
        ) : (
          <div className="relative">{closeButton}</div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
          {video.title}
        </h3>

        {/* Amendments */}
        <div className="flex flex-wrap gap-1 mb-2">
          {video.amendments.map((amendment) => (
            <span
              key={amendment}
              className="inline-block bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded"
            >
              {formatAmendment(amendment)}
            </span>
          ))}
        </div>

        {/* Date and participant chips */}
        <div className="text-xs text-gray-500 space-y-1">
          {video.recordedAt && <p>Recorded: {formatDate(video.recordedAt)}</p>}
          {video.participants && video.participants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.participants.map((participant) => (
                <span
                  key={participant}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded"
                >
                  {formatParticipant(participant)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* View button */}
        <a
          href={`/videos/${video.videoId}`}
          className="mt-2 block w-full text-center bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700 transition-colors"
        >
          View Video
        </a>
      </div>
    </Popup>
  );
}
