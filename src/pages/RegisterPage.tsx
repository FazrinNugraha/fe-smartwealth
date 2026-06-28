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
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-canvas-soft)",
        fontFamily: "var(--font-family)",
        color: "var(--color-ink)",
        position: "relative",
      }}
    >
      {/* Header / Logo */}
      <header
        style={{
          width: "100%",
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-ink)",
              letterSpacing: "-0.5px",
            }}
          >
            smart<span style={{ color: "var(--color-primary)" }}>wealth</span>
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 24px 60px 24px",
        }}
      >
        {/* Unified Card Container */}
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 960,
            background: "var(--color-canvas)",
            borderRadius: "var(--rounded-xl)",
            boxShadow: "var(--shadow-2)",
            border: "1px solid var(--color-hairline)",
            overflow: "hidden",
            minHeight: 580,
          }}
        >
          {/* Left Panel: App Mockup & Grid (Hidden on Mobile) */}
          <div
            className="login-hero-container"
            style={{
              flex: 1,
              background: "var(--color-canvas-soft)",
              padding: "48px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              borderRight: "1px solid var(--color-hairline)",
            }}
          >
            {/* Dotted Grid Background */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)",
                backgroundSize: "24px 24px",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />

            {/* Top Indicator */}
            <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "var(--shadow-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div style={{ height: 2, width: 24, background: "var(--color-primary)" }} />
            </div>

            {/* Central Floating Card (Dashboard Mockup) */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                margin: "40px 0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "var(--rounded-lg)",
                  padding: 24,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "1px solid var(--color-hairline)",
                  width: "100%",
                  maxWidth: 340,
                }}
              >
                {/* Simulated Tabs */}
                <div style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid var(--color-hairline)", paddingBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-primary)", borderBottom: "2px solid var(--color-primary)", paddingBottom: 10, cursor: "default" }}>
                    Net Worth
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-ink-mute)", paddingBottom: 10, cursor: "default" }}>
                    AI Insights
                  </span>
                </div>

                {/* Balance Value */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--color-ink-mute)", letterSpacing: "0.05em" }}>
                    Total Portfolio Value
                  </span>
                  <h3 style={{ fontSize: 24, fontWeight: 300, color: "var(--color-ink)", marginTop: 2, letterSpacing: "-0.5px" }}>
                    Rp 128.530.000
                  </h3>
                </div>

                {/* Sub-asset badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span className="pill-tag pill-tag-green" style={{ fontSize: 10 }}>Saham +3.2%</span>
                  <span className="pill-tag pill-tag-indigo" style={{ fontSize: 10 }}>Crypto +12.4%</span>
                  <span className="pill-tag pill-tag-amber" style={{ fontSize: 10 }}>Emas +0.5%</span>
                </div>
              </div>
            </div>

            {/* Bottom Headline */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 300,
                  lineHeight: 1.3,
                  color: "var(--color-ink)",
                  letterSpacing: "-0.5px",
                }}
              >
                One Click Away from <br />
                <span style={{ fontWeight: 500, color: "var(--color-primary)" }}>Smart Wealth Decisions</span>
              </h2>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div
            style={{
              flex: 1,
              padding: "48px 48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "var(--color-canvas)",
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: "var(--color-ink)",
                marginBottom: 28,
                letterSpacing: "-0.5px",
              }}
            >
              Register
            </h2>

            <form
              id="register-form"
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="form-group">
                <label className="label" htmlFor="reg-name">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="First and last name"
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="reg-email">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
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
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div
                  className="alert alert-error"
                  role="alert"
                  style={{
                    padding: "10px 14px",
                    fontSize: 13,
                    borderRadius: "var(--rounded-md)",
                    margin: 0,
                  }}
                >
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
                  padding: "12px 16px",
                  borderRadius: "var(--rounded-pill)",
                  marginTop: 10,
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
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
                      <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  "Create my account"
                )}
              </button>
            </form>

            {/* Google Sign-in */}
            <div style={{ marginTop: 16 }}>
              <GoogleSignInButton label="Sign up with Google" disabled={loading} />
            </div>

            <div
              style={{
                marginTop: 24,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: "var(--color-ink-mute)" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--color-ink-mute)",
          borderTop: "1px solid var(--color-hairline)",
          background: "var(--color-canvas)",
        }}
      >
        <div>
          <span>&copy; {new Date().getFullYear()} SmartWealth, Inc. All rights reserved.</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: "var(--color-ink-mute)", textDecoration: "none" }}>
            Terms of Service
          </a>
          <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: "var(--color-ink-mute)", textDecoration: "none" }}>
            Privacy Policy
          </a>
        </div>
      </footer>

      {/* Media query for mobile responsive display */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 960px) {
          .login-hero-container {
            display: none !important;
          }
        }
      `,
        }}
      />
    </div>
  );
};
