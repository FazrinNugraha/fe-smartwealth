/**
 * Google OAuth helper
 *
 * Flow:
 * 1. User klik "Sign in with Google" → redirect ke Google consent screen
 * 2. User approve → Google redirect ke /auth/google/callback?code=...
 * 3. GoogleCallbackPage tangkap code → POST ke backend /api/v1/auth/google
 * 4. Backend exchange code → user info → return access/refresh tokens
 * 5. Frontend simpan tokens & redirect ke /dashboard
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string;

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const SCOPES = ["openid", "email", "profile"];

/**
 * Build Google OAuth URL untuk redirect user ke Google consent screen.
 * Backend akan handle exchange code → user info di endpoint /api/v1/auth/google.
 */
export const buildGoogleAuthUrl = (): string => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("VITE_GOOGLE_CLIENT_ID not configured. Add it to fe/.env");
  }

  if (!GOOGLE_REDIRECT_URI) {
    throw new Error("VITE_GOOGLE_REDIRECT_URI not configured. Add it to fe/.env");
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

/**
 * Redirect ke Google consent screen.
 */
export const redirectToGoogle = (): void => {
  const url = buildGoogleAuthUrl();
  // Debug: log URL untuk verifikasi redirect_uri
  console.log("[Google OAuth] Redirecting to:", url);
  console.log("[Google OAuth] redirect_uri:", GOOGLE_REDIRECT_URI);
  window.location.href = url;
};
