// Map viewport state
export interface MapViewport {
  longitude: number;
  latitude: number;
  zoom: number;
}

// Bounding box for map queries [west, south, east, north]
export type BoundingBox = [number, number, number, number];

// Filter state for video search
export interface MapFilters {
  amendments: string[];
  participants: string[];
  dateFrom?: string;
  dateTo?: string;
}

// Video location from search results
export interface VideoLocation {
  id: string;
  videoId: string;
  latitude: number;
  longitude: number;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
  recordedAt?: string;
  amendments: string[];
  participantCount?: number;
}

// Cluster from location service
export interface LocationCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  expansion_zoom?: number;
  videoIds?: string[];
}

// Search API response
export interface SearchResponse {
  videos: VideoLocation[];
  total: number;
  page: number;
  pageSize: number;
}

// Search API request params
export interface SearchParams {
  bbox?: BoundingBox;
  amendments?: string[];
  participants?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  query?: string;
}

// Cluster API response
export interface ClusterResponse {
  clusters: LocationCluster[];
  zoom: number;
}

// Cluster API request params
export interface ClusterParams {
  bbox: BoundingBox;
  zoom: number;
}

// Location details from location service
export interface LocationDetails {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  videoCount: number;
}

// Video details from video service
export interface VideoDetails {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  recordedAt?: string;
  createdAt: string;
  amendments: string[];
  participants: Participant[];
  location?: LocationDetails;
}

// Participant in a video
export interface Participant {
  id: string;
  name: string;
  role?: string;
  organizationType?: string;
}

// Amendment filter options
export interface AmendmentOption {
  id: string;
  label: string;
  amendment: string;
}

// Standard amendments for filtering
// Values must match the API format (FIRST, SECOND, FOURTH, etc.)
export const AMENDMENT_OPTIONS: AmendmentOption[] = [
  { id: "1st", label: "1st Amendment", amendment: "FIRST" },
  { id: "2nd", label: "2nd Amendment", amendment: "SECOND" },
  { id: "4th", label: "4th Amendment", amendment: "FOURTH" },
  { id: "5th", label: "5th Amendment", amendment: "FIFTH" },
  { id: "14th", label: "14th Amendment", amendment: "FOURTEENTH" },
];

// Map API amendment values to display labels
const AMENDMENT_DISPLAY_MAP: Record<string, string> = {
  FIRST: "1st",
  SECOND: "2nd",
  THIRD: "3rd",
  FOURTH: "4th",
  FIFTH: "5th",
  SIXTH: "6th",
  SEVENTH: "7th",
  EIGHTH: "8th",
  NINTH: "9th",
  TENTH: "10th",
  ELEVENTH: "11th",
  TWELFTH: "12th",
  THIRTEENTH: "13th",
  FOURTEENTH: "14th",
  FIFTEENTH: "15th",
};

/**
 * Format an amendment value for display (e.g., "FIRST" -> "1st")
 */
export function formatAmendment(amendment: string): string {
  return AMENDMENT_DISPLAY_MAP[amendment] || amendment;
}

// Participant type filter options
// Values must match the API format (uppercase)
export const PARTICIPANT_TYPE_OPTIONS = [
  { id: "POLICE", label: "Police" },
  { id: "SECURITY", label: "Security" },
  { id: "GOVERNMENT", label: "Government" },
  { id: "BUSINESS", label: "Business" },
  { id: "CIVILIAN", label: "Civilian" },
];
