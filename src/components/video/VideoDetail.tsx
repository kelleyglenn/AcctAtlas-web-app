"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { getVideo } from "@/lib/api/videos";
import { Chip } from "@/components/ui/Chip";
import { MiniMap } from "@/components/video/MiniMap";
import { ModerationControls } from "@/components/video/ModerationControls";
import { AMENDMENT_OPTIONS, PARTICIPANT_TYPE_OPTIONS } from "@/types/map";
import Link from "next/link";

interface VideoDetailProps {
  videoId: string;
}

export function VideoDetail({ videoId }: VideoDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const [descExpanded, setDescExpanded] = useState(false);

  const {
    data: video,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideo(videoId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">Video not found.</p>
        <Link href="/map" className="text-blue-600 hover:underline">
          Back to Map
        </Link>
      </div>
    );
  }

  const primaryLocation =
    video.locations?.find((l) => l.isPrimary) ?? video.locations?.[0];
  const coords = primaryLocation?.location?.coordinates;
  const locationName = primaryLocation?.location?.displayName;
  const locationCity = primaryLocation?.location?.city;
  const locationState = primaryLocation?.location?.state;

  const isModerator =
    user?.trustTier === "MODERATOR" ||
    user?.trustTier === "VERIFIED";
  const isOwner = user?.id === video.submittedBy;
  const showStatus = isModerator || isOwner;
  const showModControls = isModerator && video.status === "PENDING";

  const durationMin = video.durationSeconds
    ? Math.floor(video.durationSeconds / 60)
    : null;
  const durationSec = video.durationSeconds
    ? video.durationSeconds % 60
    : null;

  const formatAmendmentLabel = (amendment: string) => {
    const opt = AMENDMENT_OPTIONS.find((o) => o.amendment === amendment);
    return opt?.label ?? amendment;
  };

  const formatParticipantLabel = (participant: string) => {
    const opt = PARTICIPANT_TYPE_OPTIONS.find((o) => o.id === participant);
    return opt?.label ?? participant;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* YouTube embed */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900">{video.title}</h1>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {video.channelName && <span>{video.channelName}</span>}
            {durationMin !== null && durationSec !== null && (
              <span>
                {durationMin}:{durationSec.toString().padStart(2, "0")}
              </span>
            )}
            {video.publishedAt && (
              <span>
                Published{" "}
                {new Date(video.publishedAt).toLocaleDateString()}
              </span>
            )}
            {video.videoDate && (
              <span>
                Incident date:{" "}
                {new Date(video.videoDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Amendments and participants */}
          <div className="flex flex-wrap gap-2">
            {video.amendments.map((a) => (
              <Chip key={a} size="sm">
                {formatAmendmentLabel(a)}
              </Chip>
            ))}
            {video.participants.map((p) => (
              <Chip key={p} size="sm">
                {formatParticipantLabel(p)}
              </Chip>
            ))}
          </div>

          {/* Description */}
          {video.description && (
            <div>
              <p
                className={`text-sm text-gray-700 whitespace-pre-wrap ${descExpanded ? "" : "line-clamp-3"}`}
              >
                {video.description}
              </p>
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-sm text-blue-600 hover:underline mt-1"
              >
                {descExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          )}

          {/* Submitter */}
          {isAuthenticated && video.submitter && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Submitted by</span>
              <span className="font-medium text-gray-700">
                {video.submitter.displayName}
              </span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status badge */}
          {showStatus && (
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  video.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : video.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {video.status}
              </span>
            </div>
          )}

          {/* Mini-map */}
          {coords && (
            <div>
              <MiniMap
                latitude={coords.latitude}
                longitude={coords.longitude}
              />
              {locationName && (
                <Link
                  href={`/map?lat=${coords.latitude}&lng=${coords.longitude}&zoom=14`}
                  className="block text-sm text-blue-600 hover:underline mt-2"
                >
                  {[locationName, locationCity, locationState]
                    .filter(Boolean)
                    .join(", ")}
                </Link>
              )}
            </div>
          )}

          {/* Moderation controls */}
          {showModControls && (
            <ModerationControls
              videoId={video.id}
              onStatusChange={() => refetch()}
            />
          )}

          {/* Back to map */}
          <Link
            href="/map"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to Map
          </Link>
        </div>
      </div>
    </div>
  );
}
