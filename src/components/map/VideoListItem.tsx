"use client";

import { useCallback } from "react";
import { useMap } from "@/providers/MapProvider";
import type { VideoLocation } from "@/types/map";

interface VideoListItemProps {
  video: VideoLocation;
  onClick?: (video: VideoLocation) => void;
}

export function VideoListItem({ video, onClick }: VideoListItemProps) {
  const {
    selectedVideoId,
    highlightedVideoId,
    setSelectedVideoId,
    setHighlightedVideoId,
    flyTo,
  } = useMap();

  const isSelected = selectedVideoId === video.id;
  const isHighlighted = highlightedVideoId === video.id;

  const handleClick = useCallback(() => {
    setSelectedVideoId(video.id);
    flyTo(video.longitude, video.latitude, 14);
    onClick?.(video);
  }, [video, setSelectedVideoId, flyTo, onClick]);

  const handleMouseEnter = useCallback(() => {
    setHighlightedVideoId(video.id);
  }, [video.id, setHighlightedVideoId]);

  const handleMouseLeave = useCallback(() => {
    setHighlightedVideoId(null);
  }, [setHighlightedVideoId]);

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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      data-video-id={video.id}
      data-testid="video-list-item"
      className={`
        p-3 border-b border-gray-100 cursor-pointer transition-colors
        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}
        ${isHighlighted && !isSelected ? "bg-gray-50" : ""}
        hover:bg-gray-50
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex gap-3">
        {/* Thumbnail - using img for external URLs with unknown dimensions */}
        {video.thumbnailUrl ? (
          <div className="relative flex-shrink-0 w-24 h-16 rounded overflow-hidden bg-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            {video.duration && (
              <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
        ) : (
          <div className="flex-shrink-0 w-24 h-16 rounded bg-gray-200 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
            {video.title}
          </h4>

          {/* Amendments */}
          {video.amendments.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {video.amendments.map((amendment) => (
                <span
                  key={amendment}
                  className="inline-block bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded"
                >
                  {amendment}A
                </span>
              ))}
            </div>
          )}

          {/* Date */}
          {video.recordedAt && (
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(video.recordedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
