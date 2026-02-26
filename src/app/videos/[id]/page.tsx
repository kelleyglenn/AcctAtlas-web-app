import type { Metadata } from "next";
import VideoDetailClient from "./VideoDetailClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE_URL}/videos/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Video" };
    const video = await res.json();
    return { title: video.title || "Video" };
  } catch {
    return { title: "Video" };
  }
}

export default function VideoPage() {
  return <VideoDetailClient />;
}
