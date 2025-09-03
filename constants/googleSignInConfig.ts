export const GOOGLE_SIGNIN_CONFIG = {
  // Client IDs from Google Console
  WEB_CLIENT_ID:
    "133826536554-6bpq7khp1jd7601bl1a0e1idkmrscdqs.apps.googleusercontent.com",
  IOS_CLIENT_ID:
    "133826536554-6bpq7khp1jd7601bl1a0e1idkmrscdqs.apps.googleusercontent.com",

  // Configuration options
  scopes: ["email", "profile"],
  webClientId: "133826536554-6bpq7khp1jd7601bl1a0e1idkmrscdqs.apps.googleusercontent.com",
  offlineAccess: true,
  hostedDomain: "",
  forceCodeForRefreshToken: true,
} as const;
