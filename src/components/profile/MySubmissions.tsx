"use client";
import { useQuery } from "@tanstack/react-query";
import { getUserVideos } from "@/lib/api/videos";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  DELETED: "bg-gray-100 text-gray-800",
} as const;

export function MySubmissions() {
  const { user } = useAuth();
  const { data: videos, isLoading } = useQuery({
    queryKey: ["my-videos", user?.id],
    queryFn: () => getUserVideos(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading)
    return <div className="text-gray-500">Loading submissions...</div>;

  if (!videos || videos.length === 0) {
    return <p className="text-sm text-gray-500">No submissions yet.</p>;
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/videos/${video.id}`}
          data-testid="submission-item"
          className="block p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            {video.thumbnailUrl && (
              <img
                src={video.thumbnailUrl}
                alt=""
                className="w-20 h-14 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {video.title}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(video.createdAt).toLocaleDateString()}
              </p>
              {video.status === "REJECTED" && video.rejectionReason && (
                <p className="text-xs text-red-600 mt-1">
                  Reason: {video.rejectionReason}
                </p>
              )}
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[video.status]}`}
            >
              {video.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
