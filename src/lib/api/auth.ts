import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
} from "@/types/api";

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    "/auth/register",
    data
  );
  return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function refreshTokens(
  refreshToken: string
): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>("/auth/refresh", {
    refreshToken,
  });
  return response.data;
}
