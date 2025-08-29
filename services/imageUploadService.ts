// Image Upload Service for Avatar and Playlist Thumbnails
export class ImageUploadService {
  // Cloudinary configuration - you need to set these up
  private static readonly CLOUDINARY_CLOUD_NAME = "your_cloud_name"; // Replace with your Cloudinary cloud name
  private static readonly CLOUDINARY_UPLOAD_PRESET = "music_app_avatars"; // Create this preset in Cloudinary

  /**
   * Upload image to Cloudinary
   * @param imageUri - Local image URI from image picker
   * @returns Promise<string> - Cloudinary secure URL
   */
  static async uploadAvatar(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();

      // Create file object for React Native
      const fileInfo = {
        uri: imageUri,
        type: "image/jpeg",
        name: `avatar_${Date.now()}.jpg`,
      };

      formData.append("file", fileInfo as any);
      formData.append("upload_preset", this.CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "music_app/avatars");
      formData.append("transformation", "w_400,h_400,c_fill,f_auto,q_auto");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  }

  /**
   * Alternative: Upload to your own backend
   * @param imageUri - Local image URI from image picker
   * @returns Promise<string> - Backend image URL
   */
  static async uploadToBackend(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();

      const fileInfo = {
        uri: imageUri,
        type: "image/jpeg",
        name: `avatar_${Date.now()}.jpg`,
      };

      formData.append("avatar", fileInfo as any);

      // Replace with your backend upload endpoint
      const response = await fetch("YOUR_BACKEND_URL/api/upload/avatar", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          // Add auth headers if needed
        },
      });

      const data = await response.json();

      if (data.success && data.url) {
        return data.url;
      } else {
        throw new Error(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image to backend:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  }

  /**
   * Check if URI is a local file
   * @param uri - Image URI
   * @returns boolean
   */
  static isLocalFile(uri: string): boolean {
    return uri.startsWith("file://") || uri.startsWith("content://");
  }

  /**
   * Upload playlist thumbnail via backend multipart/form-data
   * @param imageUri - Local image URI from image picker
   * @param authToken - Auth token for backend
   * @returns Promise<string> - Backend image URL
   */
  static async uploadPlaylistThumbnail(
    imageUri: string,
    authToken: string
  ): Promise<string> {
    try {
      const formData = new FormData();

      const fileInfo = {
        uri: imageUri,
        type: "image/jpeg",
        name: `playlist_thumbnail_${Date.now()}.jpg`,
      };

      formData.append("thumbnail", fileInfo as any);

      const response = await fetch(
        "https://nodejs-music-app-backend.vercel.app/api/upload/playlist-thumbnail",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.url) {
        return data.url;
      } else {
        throw new Error(data.message || "Failed to upload playlist thumbnail");
      }
    } catch (error) {
      console.error("Error uploading playlist thumbnail:", error);
      throw new Error("Failed to upload playlist thumbnail. Please try again.");
    }
  }
}
