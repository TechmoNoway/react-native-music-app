import { Track } from "@/types/audio";

export const isTrackLiked = (track: Track, userId?: string | number): boolean => {
  if (track.likedBy && userId) {
    const isLikedByUser = track.likedBy.some((likedUserId: string) => {
      return likedUserId === userId.toString();
    });
    return isLikedByUser;
  }
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
