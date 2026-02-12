"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@/providers/MapProvider";
import { VideoListItem } from "./VideoListItem";
import { FilterBar } from "./FilterBar";
import type { VideoLocation } from "@/types/map";

interface SidePanelProps {
  videos: VideoLocation[];
  isLoading?: boolean;
  totalCount?: number;
}

export function SidePanel({ videos, isLoading, totalCount }: SidePanelProps) {
  const { selectedVideoId } = useMap();
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to selected video when it changes
  useEffect(() => {
    if (!selectedVideoId || !listRef.current) return;

    const selectedElement = listRef.current.querySelector(
      `[data-video-id="${selectedVideoId}"]`
    );

    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedVideoId]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Videos</h2>
        {totalCount !== undefined && (
          <p className="text-sm text-gray-500">
            {totalCount.toLocaleString()} video{totalCount !== 1 ? "s" : ""} in this area
          </p>
        )}
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Video List */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-24 h-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
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
            <p className="mt-2">No videos in this area</p>
            <p className="text-sm">Try zooming out or adjusting filters</p>
          </div>
        ) : (
          videos.map((video) => <VideoListItem key={video.id} video={video} />)
        )}
      </div>
    </div>
  );
}
