import { Track } from "@/types/audio";

/**
 * Check if a track is liked by the current user
 * Priority: check likedBy array > isLiked field from API > fallback to rating
 */
export const isTrackLiked = (track: Track, userId?: string | number): boolean => {
  // First priority: check likedBy array (most accurate from backend)
  if (track.likedBy && userId) {
    return track.likedBy.some((likedUserId: string) => likedUserId === userId.toString());
  }

  // Second priority: isLiked field from API (computed field)
  if (track.isLiked !== undefined) {
    return track.isLiked;
  }

  // Fallback: legacy rating system
  return track.rating === 1;
};

/**
 * Get the display text for like/unlike action
 */
export const getLikeActionText = (isLiked: boolean): string => {
  return isLiked ? "Unlike song" : "Like song";
};

/**
 * Get the success message for like/unlike action
 */
export const getLikeSuccessMessage = (isLiked: boolean): string => {
  return isLiked ? "Song liked successfully!" : "Song unliked successfully!";
};

/**
 * Get the error message for like/unlike action
 */
export const getLikeErrorMessage = (isLiked: boolean): string => {
  return `Failed to ${isLiked ? "like" : "unlike"} song. Please try again.`;
};

/**
 * Get the loading message for like/unlike action
 */
export const getLikeLoadingMessage = (isLiked: boolean): string => {
  return isLiked ? "Unliking song..." : "Liking song...";
};
