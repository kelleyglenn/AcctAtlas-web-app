import { apiClient } from "./client";
import type { User, UpdateProfileRequest, PublicProfile } from "@/types/api";

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/users/me");
  return response.data;
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<User> {
  const response = await apiClient.put<User>("/users/me", data);
  return response.data;
}

export async function getPublicProfile(
  userId: string
): Promise<PublicProfile> {
  const response = await apiClient.get<PublicProfile>(`/users/${userId}`);
  return response.data;
}
