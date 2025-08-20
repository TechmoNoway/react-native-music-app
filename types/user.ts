// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  loginTime?: string;
  loginMethod?: string;
}

// Auth credentials for frontend use
export interface LoginCredentials {
  login: string; // Updated to match backend (email or username)
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface SocialLoginCredentials {
  provider: "google" | "facebook";
  email: string;
  name: string;
  socialId?: string;
  avatar?: string;
}

// Auth State for Redux/Context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// User data for local storage
export interface StoredUserData {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  loginTime: string;
  loginMethod: string;
}

// User preferences
export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
}
