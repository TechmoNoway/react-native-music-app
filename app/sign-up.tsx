import { useUser } from "@/store/hooks";
import { storage, StorageKeys } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// Import types and constants
import { API_CONFIG, API_ENDPOINTS, LOGIN_METHODS } from "@/constants/api";
import type { RegisterResponse } from "@/types/api";

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
  const { loginWithUserData } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateInput = () => {
    if (!username.trim()) {
      setError("Please enter a username.");
      return false;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post<RegisterResponse>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`,
        {
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        },
        {
          timeout: API_CONFIG.TIMEOUT,
          headers: API_CONFIG.HEADERS,
        }
      );

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data!;

        const userData = {
          id: user.id,
          name: user.name || user.username,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          loginTime: new Date().toISOString(),
          loginMethod: LOGIN_METHODS.EMAIL,
        };

        await storage.setItem(StorageKeys.USER_DATA, userData);
        await storage.setItem(StorageKeys.AUTH_TOKEN, token);

        if (refreshToken) {
          await storage.setItem(StorageKeys.REFRESH_TOKEN, refreshToken);
        }

        // Login user
        loginWithUserData(userData);

        // Navigate to main app
        router.replace("/(tabs)/(songs)");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data?.message || "Registration failed";
          setError(message);
        } else if (error.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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

        {/* Username Input */}
        <View className="mb-4">
          <TextInput
            placeholder="Username"
            className="border border-gray-300 rounded-full px-6 py-4 text-base text-black"
            placeholderTextColor="#888"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (error) setError("");
            }}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <TextInput
            placeholder="Email Address"
            className="border border-gray-300 rounded-full px-6 py-4 text-base text-black"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError("");
            }}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Confirm Password Input */}
        <View className="mb-6">
          <TextInput
            placeholder="Re Enter Password"
            secureTextEntry
            className="border border-gray-300 rounded-full px-6 py-4 text-base text-black"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) setError("");
            }}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Remember Me */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => !isLoading && setRememberMe(!rememberMe)}
            disabled={isLoading}
          >
            <View
              className={`w-4 h-4 border-2 mr-2 items-center justify-center ${
                rememberMe ? "bg-blue-500 border-blue-500" : "bg-white border-gray-400"
              }`}
            >
              {rememberMe && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text className={`text-sm ${isLoading ? "text-gray-400" : "text-black"}`}>
              Remember me
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-red-600 text-center text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Sign Up Button */}
        <Pressable
          className={`py-4 rounded-full items-center mb-8 flex-row justify-center ${
            isLoading ? "bg-blue-300" : "bg-blue-500"
          }`}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
          <Text className="text-white font-bold text-lg">
            {isLoading ? "Creating account..." : "Sign up"}
          </Text>
        </Pressable>

        <View className="items-center mb-8">
          <View className="flex-row items-center w-full mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google and Facebook Icons */}
          <View className="flex-row items-center justify-center space-x-6">
            <TouchableOpacity
              className={`w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-gray-200 ${
                isLoading ? "opacity-50" : ""
              }`}
              onPress={handleGoogleSignUp}
              disabled={isLoading}
            >
              <GoogleIcon />
            </TouchableOpacity>

            <TouchableOpacity
              className={`w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-md ${
                isLoading ? "opacity-50" : ""
              }`}
              onPress={handleFacebookSignUp}
              disabled={isLoading}
            >
              <FacebookIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Link */}
        <View className="items-center">
          <View className="flex-row items-center justify-center">
            <Text className="text-black text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={handleNavigateToLogin} disabled={isLoading}>
              <Text
                className={`font-medium text-sm ${
                  isLoading ? "text-gray-400" : "text-blue-500 underline"
                }`}
              >
                Log in now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
