/**
 * Google OAuth Callback Page
 *
 * Page yang ditampilkan setelah user approve di Google consent screen.
 * URL: /auth/google/callback?code=...&state=...
 *
 * Tugasnya:
 * 1. Ambil `code` dari query string
 * 2. Kirim ke backend via /api/v1/auth/google
 * 3. Simpan tokens & redirect ke /dashboard
 * 4. Kalau gagal, redirect balik ke /login dengan error message
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");

  const hasRun = React.useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoke
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Google sign-in cancelled or failed: ${errorParam}`);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!code) {
      setError("No authorization code received from Google");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    (async () => {
      try {
        await loginWithGoogle(code);
        navigate("/dashboard", { replace: true });
      } catch (err: any) {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to sign in with Google";
        setError(msg);
        setTimeout(() => navigate("/login"), 2500);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="gradient-mesh"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="card fade-in"
        style={{ maxWidth: 400, padding: 40, textAlign: "center" }}
      >
        {error ? (
          <>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fee2e2",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#991b1b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 className="heading-sm" style={{ marginBottom: 8 }}>
              Sign in failed
            </h2>
            <p
              className="caption"
              style={{ color: "var(--color-ink-mute)", marginBottom: 12 }}
            >
              {error}
            </p>
            <p className="micro" style={{ color: "var(--color-ink-mute)" }}>
              Redirecting you back to login…
            </p>
          </>
        ) : (
          <>
            <svg
              className="spin"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              style={{ display: "block", margin: "0 auto 16px" }}
            >
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
              <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
            </svg>
            <h2 className="heading-sm" style={{ marginBottom: 8 }}>
              Signing you in…
            </h2>
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Verifying your Google account
            </p>
          </>
        )}
      </div>
    </div>
  );
};
