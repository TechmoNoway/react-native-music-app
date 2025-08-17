// API Configuration
export const API_CONFIG = {
  BASE_URL: "https://nodejs-music-app-backend.vercel.app/api",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    GOOGLE: "/auth/google",
    FACEBOOK: "/auth/facebook",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USER: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
  },
  PLAYLIST: {
    LIST: "/playlists",
    CREATE: "/playlists",
    GET: (id: string) => `/playlists/${id}`,
    UPDATE: (id: string) => `/playlists/${id}`,
    DELETE: (id: string) => `/playlists/${id}`,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  INVALID_CREDENTIALS:
    "Invalid credentials. Please check your email/username and password.",
  USER_NOT_FOUND: "User not found.",
  EMAIL_ALREADY_EXISTS: "Email already registered.",
  USERNAME_ALREADY_EXISTS: "Username already taken.",
  WEAK_PASSWORD: "Password must be at least 6 characters long.",
  PASSWORDS_DONT_MATCH: "Passwords do not match.",
  INVALID_EMAIL: "Please enter a valid email address.",
  FIELD_REQUIRED: (field: string) => `${field} is required.`,
  SOMETHING_WRONG: "Something went wrong. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  REGISTER_SUCCESS: "Account created successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  RESET_LINK_SENT: "Password reset link has been sent to your email",
} as const;

// Social Login Providers
export const SOCIAL_PROVIDERS = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
} as const;

// Login Methods
export const LOGIN_METHODS = {
  EMAIL: "email",
  GOOGLE: "google",
  FACEBOOK: "facebook",
} as const;
