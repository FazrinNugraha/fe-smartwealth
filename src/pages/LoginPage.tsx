/**
 * Login Page — Modern split-screen layout with premium 3-slide dashboard carousel
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Carousel auto rotation every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Login failed. Check your credentials.",
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
        background: "var(--color-canvas)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Left side: Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 24px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
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
                fontWeight: 500,
                color: "var(--color-ink)",
                letterSpacing: "-0.28px",
              }}
            >
              SmartWealth
            </span>
          </div>

          {/* Titles */}
          <h1
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: "var(--color-ink)",
              marginBottom: 8,
              letterSpacing: "-0.6px",
            }}
          >
            Sign In
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-ink-mute)",
              marginBottom: 32,
            }}
          >
            Welcome back! Please enter your details.
          </p>

          <form
            id="login-form"
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div className="form-group">
              <label className="label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                style={{ padding: "10px 12px" }}
              />
            </div>

            <div className="form-group" style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label className="label" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ padding: "10px 40px 10px 12px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-ink-mute)",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
                marginTop: -4,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--color-ink-secondary)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: 16,
                    height: 16,
                    border: "1px solid var(--color-hairline-input)",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                />
                Remember for 30 Days
              </label>
              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontWeight: 400,
                }}
              >
                Forgot password
              </a>
            </div>

            {error && (
              <div
                className="alert alert-error"
                role="alert"
                style={{ margin: 0 }}
              >
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px 16px",
                fontSize: 15,
                borderRadius: "var(--rounded-md)",
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
                    <path
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      opacity="0.25"
                    />
                    <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
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

          {/* Google Sign-in */}
          <GoogleSignInButton label="Sign in with Google" disabled={loading} />

          <div
            style={{
              marginTop: 32,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: "var(--color-ink-mute)" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontWeight: 400,
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Hero Section (Visible only on Desktop/Tablet) */}
      <div
        className="login-hero-container"
        style={{
          flex: 1,
          padding: 24,
          display: "flex",
          minWidth: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            borderRadius: "var(--rounded-xl)",
            background:
              "linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-primary) 50%, var(--color-primary-deep) 100%)",
            padding: "48px 48px 36px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-2)",
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-20%",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Top Title Section */}
          <div style={{ color: "white", zIndex: 2 }}>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 500,
                lineHeight: 1.2,
                marginBottom: 8,
                letterSpacing: "-0.8px",
              }}
            >
              SmartWealth
            </h2>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 300,
                opacity: 0.9,
                letterSpacing: "-0.2px",
              }}
            >
              Multi-Asset Portfolio Tracker & AI Insight Engine
            </h3>
          </div>

          {/* Carousel Slide Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              zIndex: 2,
              minWidth: 0,
            }}
          >
            {/* Slide 0: Total Net Worth & Allocation */}
            {activeSlide === 0 && (
              <div
                className="fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "var(--rounded-lg)",
                    padding: 24,
                    boxShadow:
                      "var(--shadow-2), 0 20px 40px rgba(0, 0, 0, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    width: "100%",
                    maxWidth: 450,
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          color: "var(--color-ink-mute)",
                          letterSpacing: "0.05em",
                          fontWeight: 500,
                        }}
                      >
                        Total Net Worth
                      </p>
                      <p
                        style={{
                          fontSize: 24,
                          fontWeight: 300,
                          color: "var(--color-ink)",
                          marginTop: 2,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        Rp 128.530.000
                      </p>
                    </div>
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "var(--color-ink-green)",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      +4.2%
                    </span>
                  </div>

                  {/* Allocation Visual Progress Bars */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--color-ink-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#10b981",
                            }}
                          />{" "}
                          Saham
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          50.0% (Rp 64.265.000)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "var(--color-hairline)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: "50%",
                            background: "#10b981",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--color-ink-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#d97706",
                            }}
                          />{" "}
                          Emas
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          30.0% (Rp 38.559.000)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "var(--color-hairline)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: "30%",
                            background: "#d97706",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--color-ink-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#7c3aed",
                            }}
                          />{" "}
                          Crypto
                        </span>
                        <span style={{ fontWeight: 500 }}>
                          20.0% (Rp 25.706.000)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "var(--color-hairline)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: "20%",
                            background: "#7c3aed",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: 24,
                    maxWidth: 420,
                  }}
                >
                  <h4
                    style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}
                  >
                    1. Total Net Worth & Diversifikasi Aset
                  </h4>
                  <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.4 }}>
                    Visualisasikan total kekayaan bersih Anda secara real-time
                    dari seluruh jenis aset dan pantau keseimbangan proporsi
                    diversifikasi portofolio Anda secara detail.
                  </p>
                </div>
              </div>
            )}

            {/* Slide 1: Portfolio Performance */}
            {activeSlide === 1 && (
              <div
                className="fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "var(--rounded-lg)",
                    padding: 24,
                    boxShadow:
                      "var(--shadow-2), 0 20px 40px rgba(0, 0, 0, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    width: "100%",
                    maxWidth: 450,
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          color: "var(--color-ink-mute)",
                          letterSpacing: "0.05em",
                          fontWeight: 500,
                        }}
                      >
                        Portfolio Performance
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          color: "var(--color-ink-mute)",
                          marginTop: 2,
                        }}
                      >
                        Pertumbuhan hasil investasi kumulatif
                      </p>
                    </div>
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "var(--color-ink-green)",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      +Rp 5.200.000
                    </span>
                  </div>

                  {/* SVG Drawing Line Chart */}
                  <div
                    style={{
                      height: 110,
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      paddingBottom: 10,
                      borderBottom: "1px solid var(--color-hairline)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 20,
                        height: 1,
                        background: "rgba(0,0,0,0.03)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 55,
                        height: 1,
                        background: "rgba(0,0,0,0.03)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 90,
                        height: 1,
                        background: "rgba(0,0,0,0.03)",
                      }}
                    />

                    <svg
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        overflow: "visible",
                      }}
                    >
                      <path
                        d="M0 80 Q 60 100, 120 70 T 240 30 T 360 50 T 400 20"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: 600,
                          strokeDashoffset: 600,
                          animation: "drawPath 2.5s ease forwards infinite",
                        }}
                      />
                      <circle
                        cx="240"
                        cy="30"
                        r="4"
                        fill="var(--color-primary)"
                      />
                      <circle cx="400" cy="20" r="5" fill="var(--color-ruby)" />
                    </svg>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      color: "var(--color-ink-mute)",
                    }}
                  >
                    <span>27 Apr</span>
                    <span>7 Mei</span>
                    <span>17 Mei</span>
                    <span>Hari ini</span>
                  </div>
                </div>

                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: 24,
                    maxWidth: 420,
                  }}
                >
                  <h4
                    style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}
                  >
                    2. Portfolio Performance
                  </h4>
                  <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.4 }}>
                    Analisis grafik kumulatif historis nilai portofolio Anda.
                    Lihat tren naik turun keuntungan Anda dari waktu ke waktu
                    secara komprehensif dalam satu lini masa terpadu.
                  </p>
                </div>
              </div>
            )}

            {/* Slide 2: Asset & Market Performance */}
            {activeSlide === 2 && (
              <div
                className="fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "var(--rounded-lg)",
                    padding: 24,
                    boxShadow:
                      "var(--shadow-2), 0 20px 40px rgba(0, 0, 0, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    width: "100%",
                    maxWidth: 450,
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        color: "var(--color-ink-mute)",
                        letterSpacing: "0.05em",
                        fontWeight: 500,
                      }}
                    >
                      Asset & Market Performance
                    </p>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--color-primary-deep)",
                        fontWeight: 500,
                      }}
                    >
                      30 Hari Terakhir
                    </span>
                  </div>

                  {/* Mock Assets Performance Rows */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: 8,
                        borderBottom: "1px solid var(--color-canvas-soft)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#10b981",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--color-ink)",
                          }}
                        >
                          BBCA.JK
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--color-ink-mute)",
                          }}
                        >
                          Bank Central Asia
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--color-ink-green)",
                        }}
                      >
                        +6.8%
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: 8,
                        borderBottom: "1px solid var(--color-canvas-soft)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#ea2261",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--color-ink)",
                          }}
                        >
                          NVDA
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--color-ink-mute)",
                          }}
                        >
                          NVIDIA Corp
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--color-ink-green)",
                        }}
                      >
                        +14.5%
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: 8,
                        borderBottom: "1px solid var(--color-canvas-soft)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#d97706",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--color-ink)",
                          }}
                        >
                          GC=F
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--color-ink-mute)",
                          }}
                        >
                          Emas Murni
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--color-ink-green)",
                        }}
                      >
                        +3.2%
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#7c3aed",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--color-ink)",
                          }}
                        >
                          Bitcoin
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--color-ink-mute)",
                          }}
                        >
                          BTC/USD
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#ea2261",
                        }}
                      >
                        -1.8%
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: 24,
                    maxWidth: 420,
                  }}
                >
                  <h4
                    style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}
                  >
                    3. Performa Aset & Harga Pasar
                  </h4>
                  <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.4 }}>
                    Pantau kinerja imbal hasil masing-masing aset individual
                    secara real-time dan bandingkan kontribusinya langsung
                    terhadap portofolio Anda untuk mempermudah pengambilan
                    keputusan.
                  </p>
                </div>
              </div>
            )}

            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes drawPath {
                to { stroke-dashoffset: 0; }
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .fade-in {
                animation: fadeIn 0.4s ease forwards;
              }
              @media (max-width: 960px) {
                .login-hero-container {
                  display: none !important;
                }
              }
            `,
              }}
            />
          </div>

          {/* Carousel dots indicators */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: idx === activeSlide ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    idx === activeSlide ? "white" : "rgba(255,255,255,0.4)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
