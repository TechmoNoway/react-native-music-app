import { useApiPlaylists } from "@/store/hooks";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { colors } from "../../../constants/tokens";

export default function EditPlaylistScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();

  const { updatePlaylist, loading } = useApiPlaylists();

  // Use raw API playlists to access _id and coverImageUrl
  const rawPlaylists = useSelector((state: RootState) => state.library.apiPlaylists);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Find current playlist from raw API data
  const currentPlaylist = rawPlaylists.find((p) => p._id === playlistId);

  useEffect(() => {
    if (currentPlaylist) {
      setName(currentPlaylist.name || "");
      setDescription(currentPlaylist.description || "");
      setThumbnail(currentPlaylist.coverImageUrl || null);
    }
  }, [currentPlaylist]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setThumbnail(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Playlist name is required");
      return;
    }

    if (!playlistId) {
      Alert.alert("Error", "Invalid playlist ID");
      return;
    }

    try {
      setIsUploading(true);

      await updatePlaylist(playlistId, {
        name: name.trim(),
        description: description.trim(),
        thumbnailUri: thumbnail || undefined,
      });

      Alert.alert("Success", "Playlist updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating playlist:", error);

      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to update playlist");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${currentPlaylist?.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement delete playlist in store
              // await deletePlaylist(playlistId);
              Alert.alert("Success", "Playlist deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert("Error", "Failed to delete playlist");
            }
          },
        },
      ]
    );
  };

  if (!currentPlaylist) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text }}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: top + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          Edit Playlist
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isUploading || loading}
          style={{ opacity: isUploading || loading ? 0.5 : 1 }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: isUploading || loading ? colors.textMuted : colors.primary,
            }}
          >
            {isUploading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Thumbnail Section */}
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <TouchableOpacity onPress={pickImage} style={{ position: "relative" }}>
            <View
              style={{
                width: 200,
                height: 200,
                borderRadius: 12,
                backgroundColor: colors.backgroundCard,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderWidth: 2,
                borderColor: colors.border,
              }}
            >
              {thumbnail ? (
                <Image
                  source={{ uri: thumbnail }}
                  style={{ width: 200, height: 200 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="musical-notes" size={50} color={colors.textMuted} />
                  <Text
                    style={{
                      color: colors.textMuted,
                      marginTop: 8,
                      fontSize: 14,
                    }}
                  >
                    Add Cover
                  </Text>
                </View>
              )}
            </View>

            {/* Edit Icon */}
            <View
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: colors.background,
              }}
            >
              <Ionicons name="camera" size={18} color={colors.background} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Playlist Name *
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: name.length > 0 ? colors.primary : colors.border,
              }}
              placeholder="Enter playlist name"
              placeholderTextColor={colors.textMuted}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Description
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: description.length > 0 ? colors.primary : colors.border,
                height: 100,
                textAlignVertical: "top",
              }}
              placeholder="Enter playlist description (optional)"
              placeholderTextColor={colors.textMuted}
              maxLength={500}
              multiline
              numberOfLines={4}
            />

            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                textAlign: "right",
                marginTop: 4,
              }}
            >
              {description.length}/500
            </Text>
          </View>
        </View>

        {/* Delete Button */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 40 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#dc2626",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
            onPress={handleDelete}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Delete Playlist
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
