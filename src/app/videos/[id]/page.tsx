"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface VideoData {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  channelName?: string;
  amendments: string[];
  participants: string[];
  locationName?: string;
  city?: string;
  state?: string;
}

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        // For now, fetch from search API and find the video
        // In production, this would call a dedicated video endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/search?pageSize=100`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch video data");
        }

        const data = await response.json();
        const found = data.results?.find(
          (v: { id: string }) => v.id === videoId
        );

        if (!found) {
          setError("Video not found");
          return;
        }

        const primaryLocation = found.locations?.[0];
        setVideo({
          id: found.id,
          youtubeId: found.youtubeId,
          title: found.title,
          description: found.description,
          channelName: found.channelName,
          amendments: found.amendments || [],
          participants: found.participants || [],
          locationName: primaryLocation?.displayName,
          city: primaryLocation?.city,
          state: primaryLocation?.state,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Video not found"}
          </h1>
          <Link
            href="/map"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {video.title}
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video player */}
          <div className="lg:col-span-2">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Description */}
            {video.description && (
              <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Video Information
              </h2>

              <dl className="space-y-3">
                {video.channelName && (
                  <div>
                    <dt className="text-sm text-gray-500">Channel</dt>
                    <dd className="text-gray-900">{video.channelName}</dd>
                  </div>
                )}

                {video.locationName && (
                  <div>
                    <dt className="text-sm text-gray-500">Location</dt>
                    <dd className="text-gray-900">
                      {video.locationName}
                      {video.city && video.state && (
                        <span className="text-gray-500">
                          {" "}
                          - {video.city}, {video.state}
                        </span>
                      )}
                    </dd>
                  </div>
                )}

                {video.amendments.length > 0 && (
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">Amendments</dt>
                    <dd className="flex flex-wrap gap-1">
                      {video.amendments.map((amendment) => (
                        <span
                          key={amendment}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {amendment}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {video.participants.length > 0 && (
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">Participants</dt>
                    <dd className="flex flex-wrap gap-1">
                      {video.participants.map((participant) => (
                        <span
                          key={participant}
                          className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                        >
                          {participant}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Watch on YouTube */}
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-red-600 text-white text-center py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Watch on YouTube
            </a>

            {/* Back to map */}
            <Link
              href="/map"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Map
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
