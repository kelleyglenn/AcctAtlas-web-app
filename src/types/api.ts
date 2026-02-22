export type TrustTier = "NEW" | "BASIC" | "TRUSTED" | "VERIFIED" | "MODERATOR";

export interface SocialLinks {
  youtube?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  xTwitter?: string;
  bluesky?: string;
}

export interface PrivacySettings {
  socialLinksVisibility: "PUBLIC" | "REGISTERED";
  submissionsVisibility: "PUBLIC" | "REGISTERED";
}

export interface AvatarSources {
  gravatar?: string;
  youtube?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  socialLinks?: SocialLinks;
  privacySettings?: PrivacySettings;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  trustTier?: TrustTier;
  memberSince: string;
  approvedVideoCount: number;
  socialLinks?: SocialLinks;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatarUrl?: string;
  trustTier: TrustTier;
  createdAt?: string;
  socialLinks?: SocialLinks;
  privacySettings?: PrivacySettings;
  avatarSources?: AvatarSources;
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

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface VideoPreview {
  youtubeId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  channelId: string;
  channelName: string;
  publishedAt: string;
  alreadyExists: boolean;
  existingVideoId?: string;
}

export interface VideoDetailResponse {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  channelId: string;
  channelName: string;
  publishedAt: string;
  videoDate?: string;
  amendments: string[];
  participants: string[];
  status: "PENDING" | "APPROVED" | "REJECTED" | "DELETED";
  rejectionReason?: string;
  submittedBy: string;
  createdAt: string;
  locations: VideoLocationDetail[];
  submitter?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface VideoLocationDetail {
  id: string;
  videoId: string;
  locationId: string;
  isPrimary: boolean;
  location?: {
    id: string;
    displayName: string;
    city?: string;
    state?: string;
    coordinates?: { latitude: number; longitude: number };
  };
}

export interface CreateVideoRequest {
  youtubeUrl: string;
  amendments: string[];
  participants: string[];
  videoDate?: string;
  locationId?: string;
}

export interface CreateLocationRequest {
  coordinates: { latitude: number; longitude: number };
  displayName: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface CreateLocationResponse {
  id: string;
  displayName: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResponse {
  formattedAddress: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  placeId?: string;
}

export interface ExtractedLocation {
  name?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export interface ConfidenceScores {
  amendments?: number;
  participants?: number;
  videoDate?: number;
  location?: number;
}

export interface VideoMetadataExtraction {
  amendments: string[];
  participants: string[];
  videoDate?: string;
  location?: ExtractedLocation;
  confidence?: ConfidenceScores;
}

export interface ModerationItem {
  id: string;
  contentType: "VIDEO" | "LOCATION";
  contentId: string;
  submitterId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ModerationQueueResponse {
  content: ModerationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
