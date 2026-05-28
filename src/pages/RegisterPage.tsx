/**
 * Register Page — Stripi design system
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail;
      setError(
        typeof msg === "string"
          ? msg
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
      <div className="fade-in" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "var(--color-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "var(--shadow-2)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1
            className="display-md"
            style={{ color: "var(--color-ink)", marginBottom: 6 }}
          >
            Create account
          </h1>
          <p style={{ color: "var(--color-ink-mute)", fontSize: 14 }}>
            Start tracking your portfolio today
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Google Sign-in */}
          <GoogleSignInButton label="Sign up with Google" disabled={loading} />

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "var(--color-hairline)",
              }}
            />
            <span
              className="micro-cap"
              style={{ color: "var(--color-ink-mute)" }}
            >
              or
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "var(--color-hairline)",
              }}
            />
          </div>

          <form
            id="register-form"
            onSubmit={handleRegister}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div className="form-group">
              <label className="label" htmlFor="reg-name">
                Full name
              </label>
              <input
                id="reg-name"
                className="input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                minLength={2}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-email">
                Email address
              </label>
              <input
                id="reg-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-password">
                Password
              </label>
              <input
                id="reg-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "10px 16px",
                fontSize: 15,
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      opacity="0.25"
                    />
                    <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: "1px solid var(--color-hairline)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: "var(--color-ink-mute)" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontWeight: 400,
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p
          className="micro"
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "var(--color-ink-mute)",
          }}
        >
          Multi-asset portfolio tracker · Secure · Private
        </p>
      </div>
    </div>
  );
};
