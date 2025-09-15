import { GOOGLE_SIGNIN_CONFIG } from "@/constants/googleSignInConfig";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

export interface GoogleSignInUser {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
}

export interface GoogleSignInResult {
  user: GoogleSignInUser;
  idToken: string;
  accessToken: string;
}

class GoogleSignInService {
  private isConfigured = false;

  constructor() {
    this.configure();
  }

  private configure() {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_SIGNIN_CONFIG.WEB_CLIENT_ID,
        offlineAccess: GOOGLE_SIGNIN_CONFIG.offlineAccess,
        hostedDomain: GOOGLE_SIGNIN_CONFIG.hostedDomain,
        forceCodeForRefreshToken: GOOGLE_SIGNIN_CONFIG.forceCodeForRefreshToken,
        scopes: [...GOOGLE_SIGNIN_CONFIG.scopes],
      });
      this.isConfigured = true;
    } catch (error) {
      console.error(error);
      this.isConfigured = false;
    }
  }

  async signIn(): Promise<GoogleSignInResult> {
    try {
      if (!this.isConfigured) {
        throw new Error("Google Sign In not configured properly");
      }

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.user?.email) {
        throw new Error("No user information received from Google");
      }

      const tokens = await GoogleSignin.getTokens();

      const result: GoogleSignInResult = {
        user: {
          id: userInfo.data.user.id,
          name: userInfo.data.user.name,
          email: userInfo.data.user.email,
          photo: userInfo.data.user.photo,
          familyName: userInfo.data.user.familyName,
          givenName: userInfo.data.user.givenName,
        },
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
      };

      console.log("✅ Google Sign In successful:", result.user.email);
      return result;
    } catch (error: any) {
      console.error("❌ Google Sign In failed:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Sign in was cancelled by user");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Sign in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services not available");
      } else {
        throw new Error(error.message || "Google Sign In failed");
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      console.log("✅ Google Sign Out successful");
    } catch (error) {
      console.error("❌ Google Sign Out failed:", error);
      throw error;
    }
  }

  async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
      console.log("✅ Google access revoked");
    } catch (error) {
      console.error("❌ Google revoke access failed:", error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<GoogleSignInUser | null> {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();

      if (!userInfo?.user) {
        return null;
      }

      return {
        id: userInfo.user.id,
        name: userInfo.user.name,
        email: userInfo.user.email,
        photo: userInfo.user.photo,
        familyName: userInfo.user.familyName,
        givenName: userInfo.user.givenName,
      };
    } catch (error) {
      console.error("❌ Get current user failed:", error);
      return null;
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      console.error("❌ Check sign in status failed:", error);
      return false;
    }
  }

  async signInWithAccountPicker(): Promise<GoogleSignInResult> {
    try {
      const isCurrentlySignedIn = await this.isSignedIn();
      if (isCurrentlySignedIn) {
        await this.signOut();
        console.log("🔄 Logged out current account to show account picker");
      }

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.user?.email) {
        throw new Error("No user information received from Google");
      }

      const tokens = await GoogleSignin.getTokens();

      const result: GoogleSignInResult = {
        user: {
          id: userInfo.data.user.id,
          name: userInfo.data.user.name,
          email: userInfo.data.user.email,
          photo: userInfo.data.user.photo,
          familyName: userInfo.data.user.familyName,
          givenName: userInfo.data.user.givenName,
        },
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
      };

      console.log("✅ Login successful with account picker:", result.user.email);
      return result;
    } catch (error: any) {
      console.error("❌ Login with account picker failed:", error);

      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Login was cancelled");
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        throw new Error("Login is in progress");
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services is not available");
      }

      throw error;
    }
  }
}

export const googleSignInService = new GoogleSignInService();
