import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageKeys = {
  USER_DATA: "user_data",
  REMEMBER_ME: "remember_me",
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_CREDENTIALS: "user_credentials",
  RECENTLY_PLAYED: "recently_played",
  FAVORITES: "favorites",
  PLAYLISTS: "playlists",
  THEME_PREFERENCE: "theme_preference",
  FIRST_TIME_USER: "first_time_user",
};

export const storage = {
  // Save data
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  },

  // Get data
  async getItem(key: string): Promise<any> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error getting data:", error);
      return null;
    }
  },

  // Remove data
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
    }
  },

  // Clear all data
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },
};
