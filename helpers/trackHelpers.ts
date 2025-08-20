import { Track } from "@/types/audio";

/**
 * Check if a track is liked by the current user
 * Priority: check likedBy array > isLiked field from API > fallback to rating
 */
export const isTrackLiked = (track: Track, userId?: string | number): boolean => {
  console.log("isTrackLiked Debug:", {
    trackTitle: track.title,
    userId,
    userIdType: typeof userId,
    likedBy: track.likedBy,
    likedByType: typeof track.likedBy,
    isLiked: track.isLiked,
    rating: track.rating,
  });

  // First priority: check likedBy array (most accurate from backend)
  if (track.likedBy && userId) {
    const isLikedByUser = track.likedBy.some((likedUserId: string) => {
      console.log("Comparing:", {
        likedUserId,
        userId,
        userIdString: userId.toString(),
        match: likedUserId === userId.toString(),
      });
      return likedUserId === userId.toString();
    });
    console.log("likedBy result:", isLikedByUser);
    return isLikedByUser;
  }

  // Second priority: isLiked field from API (computed field)
  if (track.isLiked !== undefined) {
    console.log("Using isLiked field:", track.isLiked);
    return track.isLiked;
  }

  // Fallback: legacy rating system
  console.log("Using rating fallback:", track.rating === 1);
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
