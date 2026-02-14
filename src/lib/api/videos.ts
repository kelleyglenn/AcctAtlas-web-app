import { apiClient } from "./client";
import type {
  VideoPreview,
  VideoDetailResponse,
  CreateVideoRequest,
} from "@/types/api";

/**
 * Get details for a specific video
 */
export async function getVideo(id: string): Promise<VideoDetailResponse> {
  const response = await apiClient.get<VideoDetailResponse>(`/videos/${id}`);
  return response.data;
}

/**
 * Preview a YouTube video before submission
 */
export async function previewVideo(youtubeUrl: string): Promise<VideoPreview> {
  const response = await apiClient.get<VideoPreview>("/videos/preview", {
    params: { youtubeUrl },
  });
  return response.data;
}

/**
 * Submit a new video
 */
export async function createVideo(
  data: CreateVideoRequest
): Promise<VideoDetailResponse> {
  const response = await apiClient.post<VideoDetailResponse>("/videos", data);
  return response.data;
}
