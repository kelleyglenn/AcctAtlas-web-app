import { apiClient } from "./client";
import type { ModerationQueueResponse, ModerationItem } from "@/types/api";

/**
 * Get the moderation queue with optional filters
 */
export async function getModerationQueue(params: {
  status?: string;
  contentType?: string;
  page?: number;
  size?: number;
}): Promise<ModerationQueueResponse> {
  const response = await apiClient.get<ModerationQueueResponse>(
    "/moderation/queue",
    { params }
  );
  return response.data;
}

/**
 * Approve a moderation queue item
 */
export async function approveItem(id: string): Promise<ModerationItem> {
  const response = await apiClient.post<ModerationItem>(
    `/moderation/queue/${id}/approve`
  );
  return response.data;
}

/**
 * Reject a moderation queue item with a reason
 */
export async function rejectItem(
  id: string,
  reason: string
): Promise<ModerationItem> {
  const response = await apiClient.post<ModerationItem>(
    `/moderation/queue/${id}/reject`,
    { reason }
  );
  return response.data;
}
