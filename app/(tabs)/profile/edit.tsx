import { useUser } from "@/hooks/useUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ImageUploadService } from "@/services/imageUploadService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
import { colors } from "../../../constants/tokens";

export default function EditProfileScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { profileData, updateProfile, isLoading } = useUserProfile();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profileData) {
      setName(profileData.name || profileData.username || user?.name || "");
      setAvatar(profileData.avatar || null);
    }
  }, [profileData, user]);

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
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setIsUploading(true);

      let avatarToSave = avatar;

      // If avatar is a local file, upload it first
      if (avatar && ImageUploadService.isLocalFile(avatar)) {
        try {
          console.log("Uploading new avatar...");
          // You can choose between Cloudinary or your backend
          avatarToSave = await ImageUploadService.uploadAvatar(avatar);
          console.log("Avatar uploaded successfully:", avatarToSave);
        } catch (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          Alert.alert(
            "Upload Error",
            "Failed to upload avatar. Continue without changing avatar?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Continue",
                onPress: () => {
                  // Continue with existing avatar
                  avatarToSave = profileData?.avatar || undefined;
                },
              },
            ]
          );
          return;
        }
      }

      await updateProfile({
        username: name.trim(),
        avatar: avatarToSave || undefined,
      });

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);

      // Handle specific error messages from API
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes("Username already taken")) {
          Alert.alert(
            "Error",
            "This username is already taken. Please choose another one."
          );
        } else if (errorMessage.includes("Email already registered")) {
          Alert.alert("Error", "This email is already registered.");
        } else {
          Alert.alert("Error", errorMessage);
        }
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const suggestedNames = ["Techmo", "Techno", "Technology"];

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
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          Edit profile
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isUploading || isLoading}
          style={{ opacity: isUploading || isLoading ? 0.5 : 1 }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: isUploading || isLoading ? colors.textMuted : colors.primary,
            }}
          >
            {isUploading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Picture Section */}
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <TouchableOpacity onPress={pickImage} style={{ position: "relative" }}>
            <View
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: "#2A1A5E",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderWidth: 3,
                borderColor: "#4A3A8E",
              }}
            >
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={{ width: 150, height: 150 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 150,
                    height: 150,
                    backgroundColor: "#2A1A5E",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {/* Gradient overlay simulation */}
                  <View
                    style={{
                      position: "absolute",
                      width: 150,
                      height: 150,
                      backgroundColor: "#4A3A8E",
                      opacity: 0.6,
                    }}
                  />
                  <Ionicons name="person" size={60} color="#fff" />
                </View>
              )}
            </View>

            {/* Edit Icon */}
            <View
              style={{
                position: "absolute",
                bottom: 5,
                right: 5,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.text,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: colors.background,
              }}
            >
              <Ionicons name="pencil" size={18} color={colors.background} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name Input Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Name
          </Text>

          <View style={{ position: "relative" }}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: colors.text,
                paddingRight: 50,
                borderWidth: 1,
                borderColor: name.length > 0 ? colors.primary : colors.border,
              }}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              maxLength={50}
            />

            {name.length > 0 && (
              <TouchableOpacity
                onPress={() => setName("")}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 18,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.textMuted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={12} color={colors.background} />
              </TouchableOpacity>
            )}
          </View>

          {/* Character count indicator */}
          <View style={{ alignItems: "flex-end", marginTop: 4 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: name.length > 0 ? colors.primary : colors.textMuted,
              }}
            />
          </View>
        </View>

        {/* Suggested Names */}
        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {suggestedNames.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setName(suggestion)}
                style={{
                  backgroundColor: colors.backgroundCard,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: name === suggestion ? colors.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    color: name === suggestion ? colors.primary : colors.text,
                    fontSize: 14,
                  }}
                >
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
