import { Artist, Track } from "./audio";

// API Base types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Songs API response
export interface SongsApiResponse {
  success: boolean;
  message?: string;
  data: {
    songs: Track[];
    total: number;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Search songs API response
export interface SearchSongsResponse {
  success: boolean;
  message?: string;
  data: {
    songs: Track[];
    total: number;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
}

// Artist API response
export interface ArtistsApiResponse {
  artists: Artist[];
  total: number;
}

// Playlist API types
export interface PlaylistApiResponse {
  _id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  owner: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  songs: Track[];
  totalDuration: number;
  isDefault: boolean;
  playlistType: "liked" | "custom";
  createdAt: string;
  updatedAt: string;
}

export interface GetPlaylistsResponse {
  success: boolean;
  message?: string;
  data: {
    playlists: PlaylistApiResponse[];
    total: number;
  };
}

export interface GetPlaylistResponse {
  success: boolean;
  message?: string;
  data: {
    playlist: PlaylistApiResponse;
  };
}

export interface CreatePlaylistRequest {
  name: string;
  description?: string;
  coverImageUrl?: string;
}

export interface AddSongToPlaylistRequest {
  songId: string;
}

// Auth related API types
export interface AuthResponseData {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar?: string;
  };
  token: string;
  refreshToken?: string;
}

export interface SocialAuthResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    provider: string;
  };
  token: string;
  refreshToken?: string;
}

// Specific API response types
export type LoginResponse = ApiResponse<AuthResponseData>;
export type RegisterResponse = ApiResponse<AuthResponseData>;
export type SocialLoginResponse = ApiResponse<SocialAuthResponseData>;
export type RefreshTokenResponse = ApiResponse<{ token: string; refreshToken?: string }>;
export type UserProfileResponse = ApiResponse<{ user: any }>;

// Error response type
export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: null;
  errors?: string[];
}

// Request types
export interface LoginRequest {
  login: string; // email or username
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface SocialLoginRequest {
  provider: "google" | "facebook";
  email: string;
  name: string;
  socialId?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}
