import { useUser } from "@/hooks/useUser";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  const { profileData, updateProfile, fetchProfile, isLoading } = useUserProfile();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log("Fetching profile data...");
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    console.log("User data:", user);
    console.log("Profile data:", profileData);

    if (profileData) {
      console.log("Using profile data:", {
        username: profileData.username,
        email: profileData.email,
        avatar: profileData.avatar,
      });
      setUsername(profileData.username || user?.username || "");
      setEmail(profileData.email || user?.email || "");
      setAvatar(profileData.avatar || null);
    } else if (user) {
      console.log("Using user data as fallback:", {
        username: user.username,
        email: user.email,
      });
      setUsername(user.username || "");
      setEmail(user.email || "");
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
        mediaTypes: ["images"],
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
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    try {
      setIsUploading(true);
      await updateProfile({
        username: username.trim(),
        email: email.trim(),
        avatar: avatar || undefined,
      });

      console.log("Profile updated successfully");

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);

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
        {/* Loading indicator */}
        {isLoading && !profileData && (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              Loading profile data...
            </Text>
          </View>
        )}

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

        {/* Username Input Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Username
          </Text>

          <View style={{ position: "relative" }}>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: colors.text,
                paddingRight: 50,
                borderWidth: 1,
                borderColor: username.length > 0 ? colors.primary : colors.border,
              }}
              placeholder={
                profileData?.username || user?.username || "Enter your username"
              }
              placeholderTextColor={colors.textMuted}
              maxLength={50}
              autoCapitalize="none"
            />

            {username.length > 0 && (
              <TouchableOpacity
                onPress={() => setUsername("")}
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
                backgroundColor: username.length > 0 ? colors.primary : colors.textMuted,
              }}
            />
          </View>
        </View>

        {/* Email Input Section */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Email
          </Text>

          <View style={{ position: "relative" }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={{
                backgroundColor: colors.backgroundCard,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: colors.text,
                paddingRight: 50,
                borderWidth: 1,
                borderColor: email.length > 0 ? colors.primary : colors.border,
              }}
              placeholder={profileData?.email || user?.email || "Enter your email"}
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {email.length > 0 && (
              <TouchableOpacity
                onPress={() => setEmail("")}
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
                backgroundColor: email.length > 0 ? colors.primary : colors.textMuted,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
