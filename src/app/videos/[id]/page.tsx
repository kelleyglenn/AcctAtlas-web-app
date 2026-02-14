"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const VideoDetail = dynamic(
  () => import("@/components/video/VideoDetail").then((mod) => mod.VideoDetail),
  { ssr: false }
);

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id as string;

  return <VideoDetail videoId={videoId} />;
}
