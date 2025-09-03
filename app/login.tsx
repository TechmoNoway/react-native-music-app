import { API_CONFIG, API_ENDPOINTS, LOGIN_METHODS } from "@/constants/api";
import { useUser } from "@/hooks/useUser";
import { googleSignInService } from "@/services/googleSignInService";
import type { LoginResponse, SocialLoginResponse } from "@/types/api";
import { storage, StorageKeys } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import axios, { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithUserData } = useUser();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedCredentials = await storage.getItem(StorageKeys.USER_CREDENTIALS);
      const rememberMeStatus = await storage.getItem(StorageKeys.REMEMBER_ME);

      if (savedCredentials && rememberMeStatus) {
        setUsernameOrEmail(savedCredentials.usernameOrEmail || "");
        setPassword(savedCredentials.password || "");
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Error loading saved credentials:", error);
    }
  };

  const handleNavigateToSignUp = () => {
    if (!isLoading) {
      router.push("/sign-up");
    }
  };

  const validateInput = () => {
    if (!usernameOrEmail.trim()) {
      setError("Please enter your email or username.");
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

    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post<LoginResponse>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
        {
          login: usernameOrEmail.trim(),
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

        if (rememberMe) {
          await storage.setItem(StorageKeys.USER_CREDENTIALS, {
            usernameOrEmail: usernameOrEmail.trim(),
            password: password.trim(),
          });
          await storage.setItem(StorageKeys.REMEMBER_ME, true);
        } else {
          await storage.removeItem(StorageKeys.USER_CREDENTIALS);
          await storage.removeItem(StorageKeys.REMEMBER_ME);
        }

        loginWithUserData(userData);

        router.replace("/(tabs)/(songs)");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (isAxiosError(error)) {
        if (error.response) {
          // Server responded with error
          const message = error.response.data?.message || "Invalid credentials";
          setError(message);
        } else if (error.request) {
          // Network error
          setError("Network error. Please check your connection.");
        } else {
          // Request setup error
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const googleResponse = await googleSignInService.signIn();

      console.log("Google Sign In Response:", googleResponse);

      // Send the Google token to your backend for verification
      const response = await axios.post<SocialLoginResponse>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`,
        {
          googleToken: googleResponse.idToken,
          accessToken: googleResponse.accessToken,
          provider: "google",
          userInfo: {
            id: googleResponse.user.id,
            name: googleResponse.user.name,
            email: googleResponse.user.email,
            photo: googleResponse.user.photo,
            givenName: googleResponse.user.givenName,
            familyName: googleResponse.user.familyName,
          },
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
          name: user.name || googleResponse.user.name || "Unknown",
          email: user.email || googleResponse.user.email || "",
          avatar: user.avatar || googleResponse.user.photo || undefined,
          loginMethod: LOGIN_METHODS.GOOGLE,
          loginTime: new Date().toISOString(),
        };

        console.log("=== GOOGLE LOGIN SUCCESS ===");
        console.log("Full Backend Response:", JSON.stringify(response.data, null, 2));
        console.log("User Data from Backend:", JSON.stringify(user, null, 2));
        console.log("Google Response:", JSON.stringify(googleResponse, null, 2));
        console.log("Final User Data:", JSON.stringify(userData, null, 2));
        console.log("Auth Token:", token);
        console.log("Refresh Token:", refreshToken);
        console.log("===============================");

        await storage.setItem(StorageKeys.USER_DATA, userData);
        await storage.setItem(StorageKeys.AUTH_TOKEN, token);

        if (refreshToken) {
          await storage.setItem(StorageKeys.REFRESH_TOKEN, refreshToken);
        }

        loginWithUserData(userData);
        router.replace("/(tabs)/(songs)");
      } else {
        setError(response.data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);

      if (isAxiosError(error) && error.response) {
        setError(error.response.data?.message || "Google login failed");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // You would integrate with Facebook SDK here
      // For now, making API call with Facebook token

      const response = await axios.post<SocialLoginResponse>(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.FACEBOOK}`,
        {
          // facebookToken: facebookToken,
          provider: "facebook",
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
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          loginMethod: LOGIN_METHODS.FACEBOOK,
          loginTime: new Date().toISOString(),
        };

        await storage.setItem(StorageKeys.USER_DATA, userData);
        await storage.setItem(StorageKeys.AUTH_TOKEN, token);

        if (refreshToken) {
          await storage.setItem(StorageKeys.REFRESH_TOKEN, refreshToken);
        }

        loginWithUserData(userData);
        router.replace("/(tabs)/(songs)");
      } else {
        setError(response.data.message || "Facebook login failed");
      }
    } catch (error) {
      console.error("Facebook login error:", error);

      if (isAxiosError(error) && error.response) {
        setError(error.response.data?.message || "Facebook login failed");
      } else {
        setError("Facebook login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!isLoading) {
      // Show alert for now since forgot password screen doesn't exist
      Alert.alert("Forgot Password", "You will be redirected to reset your password.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            // For now, just show a message. You can implement forgot password API call here
            Alert.alert("Coming Soon", "Password reset feature will be available soon.");
          },
        },
      ]);
    }
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
            onChangeText={(text) => {
              setUsernameOrEmail(text);
              if (error) setError("");
            }}
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
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

        {/* Remember Me & Forgot Password */}
        <View className="flex-row justify-between items-center mb-8">
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

          <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
            <Text className={`text-sm ${isLoading ? "text-gray-400" : "text-blue-500"}`}>
              Forgot Your Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-red-600 text-center text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Sign In Button */}
        <Pressable
          className={`py-4 rounded-full items-center mb-8 flex-row justify-center ${
            isLoading ? "bg-blue-300" : "bg-blue-500"
          }`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
          <Text className="text-white font-bold text-lg">
            {isLoading ? "Signing in..." : "Sign in"}
          </Text>
        </Pressable>

        {/* Or Section */}
        <View className="items-center mb-8">
          <View className="flex-row items-center w-full mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google and Facebook Icons */}
          <View className="flex flex-row items-center justify-center gap-5">
            <TouchableOpacity
              className={`w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-gray-200 ${
                isLoading ? "opacity-50" : ""
              }`}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon />
            </TouchableOpacity>

            <TouchableOpacity
              className={`w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-gray-200 ${
                isLoading ? "opacity-50" : ""
              }`}
              onPress={handleFacebookLogin}
              disabled={isLoading}
            >
              <FacebookIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View className="items-center">
          <View className="flex-row items-center justify-center">
            <Text className="text-black text-sm">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={handleNavigateToSignUp} disabled={isLoading}>
              <Text
                className={`font-medium text-sm ${
                  isLoading ? "text-gray-400" : "text-blue-500"
                }`}
              >
                Sign up
              </Text>
            </TouchableOpacity>
            <Text className="text-black text-sm"> for free!</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
