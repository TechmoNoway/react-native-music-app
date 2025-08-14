import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

const FacebookIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </Svg>
);

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    router.replace("/(tabs)/(songs)");
  };

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  const handleGoogleSignUp = () => {
    console.log("Google signup");
    // router.replace("/(tabs)");
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook signup");
    // router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Ionicons name="musical-notes" size={40} color="white" />
          </View>
          <Text className="text-blue-500 text-3xl font-bold">Maestro</Text>
        </View>

        <Text className="text-black text-lg font-medium text-center mb-12">
          Enjoy Listening To Music
        </Text>

        <View className="mb-4">
          <TextInput
            placeholder="Email Address or Username"
            className="border border-gray-300 rounded-full px-6 py-4 text-base text-black"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

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

        <View className="mb-6">
          <TextInput
            placeholder="Re Enter Password"
            secureTextEntry
            className="border border-gray-300 rounded-full px-6 py-4 text-base text-black"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              className={`w-4 h-4 border border-gray-400 mr-3 ${
                rememberMe ? "bg-blue-500" : "bg-white"
              }`}
            >
              {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text className="text-black text-sm">Remember me</Text>
          </TouchableOpacity>
        </View>

        <Pressable
          className="bg-blue-500 py-4 rounded-full items-center mb-8"
          onPress={handleSignUp}
        >
          <Text className="text-white font-bold text-lg">Sign up</Text>
        </Pressable>

        <View className="items-center mb-8">
          <View className="flex-row items-center w-full mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="flex-row items-center justify-center space-x-6">
            <TouchableOpacity
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-gray-200"
              onPress={handleGoogleSignUp}
            >
              <GoogleIcon />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-md"
              onPress={handleFacebookSignUp}
            >
              <FacebookIcon />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center">
          <View className="flex-row items-center justify-center">
            <Text className="text-black text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={handleNavigateToLogin}>
              <Text className="text-blue-500 font-medium text-sm underline">
                Log in now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
