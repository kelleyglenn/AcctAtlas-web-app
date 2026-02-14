import type { VideoPreview } from "@/types/api";

interface YouTubePreviewProps {
  preview: VideoPreview;
}

export function YouTubePreview({ preview }: YouTubePreviewProps) {
  const minutes = preview.durationSeconds
    ? Math.floor(preview.durationSeconds / 60)
    : null;
  const seconds = preview.durationSeconds ? preview.durationSeconds % 60 : null;

  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <img
        src={preview.thumbnailUrl}
        alt={preview.title}
        className="w-40 h-24 object-cover rounded flex-shrink-0"
      />
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {preview.title}
        </h3>
        <p className="text-sm text-gray-600">{preview.channelName}</p>
        <div className="flex gap-3 mt-1 text-xs text-gray-500">
          {minutes !== null && seconds !== null && (
            <span>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          )}
          <span>
            Published {new Date(preview.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
