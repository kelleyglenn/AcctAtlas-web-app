export type TrustTier = "NEW" | "BASIC" | "TRUSTED" | "VERIFIED" | "MODERATOR";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatarUrl?: string;
  trustTier: TrustTier;
  createdAt?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResponse {
  user: User;
  tokens: TokenPair;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

export interface ApiError {
  code: string;
  message: string;
}
