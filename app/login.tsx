import { useAppDispatch } from "@/store";
import { login } from "@/store/userSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
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

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleNavigateToOnboarding = () => {
    router.push("/onboarding");
  };

  const handleLogin = () => {
    if (!usernameOrEmail || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    dispatch(login({ usernameOrEmail, password }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        {/* Maestro Logo */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Ionicons name="musical-notes" size={40} color="white" />
          </View>
          <Text className="text-blue-500 text-3xl font-bold">Maestro</Text>
        </View>

        <Text className="text-black text-lg font-medium text-center mb-12">
          Enjoy Listening To Music
        </Text>

        {/* Email Input */}
        <View className="mb-4">
          <TextInput
            placeholder="Email Address or Username"
            className="border border-gray-300 rounded-full px-6 py-4 text-base text-black"
            placeholderTextColor="#888"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <TextInput
            placeholder="Password"
            secureTextEntry
            className="border border-gray-300 rounded-full px-6 py-4 text-base text-black"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Remember Me & Forgot Password */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              className={`w-4 h-4 border border-gray-400 mr-2 ${
                rememberMe ? "bg-blue-500" : "bg-white"
              }`}
            >
              {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text className="text-black text-sm">Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text className="text-blue-500 text-sm">Forgot Your Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}

        {/* Sign In Button */}
        <Pressable
          className="bg-blue-500 py-4 rounded-full items-center mb-8"
          onPress={handleLogin}
        >
          <Text className="text-white font-bold text-lg">Sign in</Text>
        </Pressable>

        {/* Or Section */}
        <View className="items-center mb-8">
          <View className="flex-row items-center w-full mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google and Apple Icons */}
          <View className="flex-row items-center justify-center space-x-6">
            <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-gray-200">
              <GoogleIcon />
            </TouchableOpacity>

            <TouchableOpacity className="w-12 h-12 bg-black rounded-full items-center justify-center shadow-md">
              <Ionicons name="logo-apple" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View className="items-center">
          <View className="flex-row items-center justify-center">
            <Text className="text-black text-sm">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={handleNavigateToOnboarding}>
              <Text className="text-blue-500 font-medium text-sm">Sign up</Text>
            </TouchableOpacity>
            <Text className="text-black text-sm"> for free!</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
