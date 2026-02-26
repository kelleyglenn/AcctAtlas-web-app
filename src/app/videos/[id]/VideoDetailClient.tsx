"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const VideoDetail = dynamic(
  () => import("@/components/video/VideoDetail").then((mod) => mod.VideoDetail),
  { ssr: false }
);

export default function VideoDetailClient() {
  const params = useParams();
  const videoId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);

  return <VideoDetail videoId={videoId} />;
}
