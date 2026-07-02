/** Internal Pexels API response shapes — never exposed outside the provider. */

export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  liked: boolean;
  alt: string;
}

export interface PexelsSearchResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

export type PexelsSearchErrorCode =
  | "missing_api_key"
  | "search_disabled"
  | "auth_failure"
  | "rate_limited"
  | "empty_query"
  | "empty_results"
  | "network_error"
  | "malformed_response"
  | "http_error";

export interface PexelsSearchFailure {
  code: PexelsSearchErrorCode;
  message: string;
  status?: number;
  retryAfterSeconds?: number;
}
