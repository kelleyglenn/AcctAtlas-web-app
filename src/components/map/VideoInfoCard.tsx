"use client";

import { Popup } from "react-map-gl/mapbox";
import { useMap } from "@/providers/MapProvider";
import { formatAmendment, type VideoLocation } from "@/types/map";

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

  return (
    <Popup
      longitude={video.longitude}
      latitude={video.latitude}
      anchor="bottom"
      onClose={handleClose}
      closeOnClick={false}
      className="video-info-popup"
      maxWidth="300px"
    >
      <div className="p-1">
        {/* Thumbnail - using img for external URLs with unknown dimensions */}
        {video.thumbnailUrl && (
          <div className="relative mb-2 rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-32 object-cover"
            />
            {video.duration && (
              <span className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
          {video.title}
        </h3>

        {/* Metadata */}
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

        {/* Date and participants */}
        <div className="text-xs text-gray-500 space-y-0.5">
          {video.recordedAt && <p>Recorded: {formatDate(video.recordedAt)}</p>}
          {video.participantCount !== undefined && video.participantCount > 0 && (
            <p>{video.participantCount} participant{video.participantCount !== 1 ? "s" : ""}</p>
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
