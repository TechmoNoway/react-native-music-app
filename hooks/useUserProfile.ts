import { UserService } from "@/services/userService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "./useUser";

export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useUser();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProfile = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const profile = await UserService.getUserProfile(forceRefresh);
      if (isMountedRef.current) {
        setProfileData(profile);
      }
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile";
      if (isMountedRef.current) {
        setError(errorMessage);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const updateProfile = useCallback(
    async (userData: { username?: string; email?: string; avatar?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedProfile = await UserService.updateUserProfile(userData);
        setProfileData(updatedProfile);

        await updateUser({
          id: updatedProfile.id || updatedProfile._id,
          name: updatedProfile.name || updatedProfile.username,
          email: updatedProfile.email,
          username: updatedProfile.username,
          avatar: updatedProfile.avatar,
        });

        return updatedProfile;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update profile";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await UserService.changePassword(currentPassword, newPassword);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to change password";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    profileData,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    clearError: () => setError(null),
    clearCache: () => {
      setProfileData(null);
      UserService.clearCache();
    },
  };
};
