import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
    <Path
      d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V5.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.642H7.078v3.47h3.047v8.385a11.99 11.99 0 003.75 0v-8.385h2.796z"
      fill="#ffffff"
    />
  </Svg>
);

export default function OnboardingScreen() {
  const router = useRouter();

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  const handleNavigateToSignUp = () => {
    router.push("/sign-up");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 relative">
        <View className="absolute inset-0 opacity-30">
          <View className="flex-row flex-wrap justify-around pt-20">
            {Array.from({ length: 15 }).map((_, index) => (
              <View
                key={index}
                className="w-16 h-16 bg-gray-600 rounded-full mb-4"
                style={{
                  marginHorizontal: Math.random() * 20,
                  marginTop: Math.random() * 40,
                }}
              />
            ))}
          </View>
        </View>

        <View className="absolute inset-0 bg-black/70" />

        <View className="flex-1 justify-end px-6 pb-24">
          <View className="items-center mb-20">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-8">
              <Ionicons name="musical-notes" size={36} color="white" />
            </View>

            <Text className="text-white text-3xl font-bold text-center leading-tight mb-2">
              Millions of songs.
            </Text>
            <Text className="text-white text-3xl font-bold text-center leading-tight">
              Free on Maestro.
            </Text>
          </View>

          <View className="flex flex-col gap-4">
            <Pressable
              className="bg-blue-500 py-4 rounded-full items-center"
              onPress={handleNavigateToSignUp}
            >
              <Text className="text-white font-bold text-lg">Sign up free</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-full border border-white py-4 px-6"
              onPress={handleNavigateToSignUp}
            >
              <View className="w-5 h-5 rounded-sm mr-4 items-center justify-center">
                <Ionicons name="call" size={16} color="white" />
              </View>
              <Text className="text-white font-medium text-base flex-1 text-center">
                Continue with phone number
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-full border border-white py-4 px-6"
              onPress={handleNavigateToSignUp}
            >
              <View className="w-5 h-5 mr-4 items-center justify-center">
                <GoogleIcon />
              </View>
              <Text className="text-white font-medium text-base flex-1 text-center">
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-full border border-white py-4 px-6"
              onPress={handleNavigateToSignUp}
            >
              <View className="w-5 h-5 mr-4 items-center justify-center">
                <FacebookIcon />
              </View>
              <Text className="text-white font-medium text-base flex-1 text-center">
                Continue with Facebook
              </Text>
            </Pressable>

            <View className="items-center mt-4">
              <Pressable onPress={handleNavigateToLogin}>
                <Text className="text-white underline font-medium text-lg">Log in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
