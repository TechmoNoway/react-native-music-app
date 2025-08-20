import { useUser } from "@/hooks/useUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/tokens";

const profileSections = [
  {
    title: "Account",
    items: [
      { icon: "person-outline", label: "Edit Profile", action: "navigate" },
      // { icon: "card-outline", label: "Subscription", action: "navigate" },
      // { icon: "download-outline", label: "Downloads", action: "navigate" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: "moon-outline", label: "Dark Mode", action: "toggle" },
      // { icon: "notifications-outline", label: "Notifications", action: "navigate" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle-outline", label: "Help & FAQ", action: "navigate" },
      { icon: "chatbubble-outline", label: "Contact Us", action: "navigate" },
      // { icon: "star-outline", label: "Rate App", action: "navigate" },
    ],
  },
];

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();
  const { user, logout } = useUser();
  const { profileData, isLoading: isLoadingProfile, fetchProfile } = useUserProfile();
  const hasLoadedProfile = useRef(false);
  const currentUserId = useRef<string | number | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      router.replace("/login");
    }
  }, [logout, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !user.id) return;

      if (currentUserId.current !== user.id) {
        hasLoadedProfile.current = false;
        currentUserId.current = user.id;
      }

      if (hasLoadedProfile.current) return;

      hasLoadedProfile.current = true;
      try {
        await fetchProfile();
      } catch (error) {
        console.error("Error loading profile:", error);
        hasLoadedProfile.current = false;
        if (error instanceof Error && error.message === "Authentication expired") {
          Alert.alert("Session Expired", "Please login again.", [
            { text: "OK", onPress: handleLogout },
          ]);
        }
      }
    };

    loadProfile();
  }, [user, fetchProfile, handleLogout]);

  const renderProfileItem = (item: any, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons name={item.icon} size={24} color={colors.primary} />
          <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
            {item.label}
          </Text>
        </View>

        {item.action === "toggle" ? (
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={darkMode ? "#f4f3f4" : "#f4f3f4"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, paddingTop: 15 }}>
        {/* User Info Section */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 40,
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#333",
          }}
        >
          {isLoadingProfile ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 48,
                  backgroundColor: "#1a1a1a",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                {profileData?.avatar ? (
                  <Image
                    source={{ uri: profileData.avatar }}
                    style={{ width: 110, height: 110 }}
                    resizeMode="cover"
                    className="rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={40} color={colors.textMuted} />
                )}
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                {profileData?.name ||
                  profileData?.username ||
                  user?.name ||
                  "Music Lover"}
              </Text>
            </>
          )}
        </View>

        {/* Settings Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View style={{ marginTop: 24 }} key={sectionIndex}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#999",
                paddingHorizontal: 24,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {section.title}
            </Text>
            <View
              style={{
                backgroundColor: colors.backgroundCard,
                marginHorizontal: 16,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {section.items.map((item, itemIndex) => renderProfileItem(item, itemIndex))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={{
            marginHorizontal: 16,
            marginTop: 32,
            marginBottom: 24,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#dc2626",
          }}
          onPress={handleLogout}
        >
          <Text style={{ textAlign: "center", color: "#fff", fontWeight: "600" }}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={{ alignItems: "center", paddingBottom: 80 }}>
          <Text style={{ fontSize: 12, color: "#666" }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
