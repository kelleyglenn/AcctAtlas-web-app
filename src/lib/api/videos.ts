import { apiClient } from "./client";
import type { VideoDetails } from "@/types/map";

/**
 * Get details for a specific video
 */
export async function getVideo(id: string): Promise<VideoDetails> {
  const response = await apiClient.get<VideoDetails>(`/videos/${id}`);
  return response.data;
}
