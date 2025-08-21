import { UserService } from "@/services/userService";
import { storage, StorageKeys } from "@/utils/storage";
import { useEffect, useState } from "react";

export interface User {
  id: number | string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  usernameOrEmail?: string;
  loginMethod?: string;
  loginTime?: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await storage.getItem(StorageKeys.USER_DATA);
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await storage.setItem(StorageKeys.USER_DATA, userData);
      setUser(userData);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const loginWithUserData = async (userData: User) => {
    try {
      await storage.setItem(StorageKeys.USER_DATA, userData);
      setUser(userData);
    } catch (error) {
      console.error("Error logging in with user data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem(StorageKeys.USER_DATA);
      await storage.removeItem(StorageKeys.AUTH_TOKEN);
      await storage.removeItem(StorageKeys.REFRESH_TOKEN);
      await storage.removeItem(StorageKeys.USER_CREDENTIALS);
      await storage.removeItem(StorageKeys.REMEMBER_ME);

      UserService.clearCache();

      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return {
    user,
    isLoading,
    updateUser,
    loginWithUserData,
    logout,
    loadUser,
  };
};
