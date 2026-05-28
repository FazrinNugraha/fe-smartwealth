/**
 * Insights Page — Rule-based + AI insights, Stripi design
 */

import React, { useState, useEffect } from "react";
import { AppShell } from "../components";
import { getRuleBasedInsights, getAIInsights, refreshAIInsights } from "../api";

const SEVERITY_STYLE: Record<string, string> = {
  high: "alert-error",
  medium: "alert-warn",
  low: "alert-info",
};
const HEALTH_COLOR: Record<string, string> = {
  excellent: "#166534",
  good: "var(--color-primary)",
  fair: "#92400e",
  poor: "#c2410c",
  critical: "#991b1b",
};

export const InsightsPage: React.FC = () => {
  const [ruleData, setRuleData] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await getRuleBasedInsights();
      setRuleData(r);
      try {
        setAiData(await getAIInsights());
      } catch {
        /* AI optional */
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAI = async () => {
    setAiLoading(true);
    try {
      setAiData(await refreshAIInsights());
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to generate AI insights");
    } finally {
      setAiLoading(false);
    }
  };

  const score = ruleData?.health_score ?? 0;
  const scoreColor =
    HEALTH_COLOR[ruleData?.health_status] ?? "var(--color-ink-mute)";

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="heading-md">Insights</h1>
          <p
            className="caption"
            style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
          >
            Rule-based analysis + AI recommendations
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 109-9M3 3v9h9" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="page-body" style={{ margin: "0 auto" }}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              className="skeleton"
              style={{ height: 120, borderRadius: 12 }}
            />
            <div
              className="skeleton"
              style={{ height: 200, borderRadius: 12 }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* ── Health Score ── */}
            {ruleData && (
              <div className="card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <p className="heading-sm">Portfolio Health</p>
                  <span
                    className="pill-tag"
                    style={{ background: scoreColor + "22", color: scoreColor }}
                  >
                    {ruleData.health_status?.charAt(0).toUpperCase() +
                      ruleData.health_status?.slice(1)}
                  </span>
                </div>

                {/* Score */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 300,
                      color: scoreColor,
                      lineHeight: 1,
                      fontFeatureSettings: '"tnum"',
                      letterSpacing: -1.4,
                    }}
                  >
                    {score}
                  </span>
                  <span
                    className="body-md"
                    style={{ color: "var(--color-ink-mute)", paddingBottom: 8 }}
                  >
                    /100
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 6,
                    background: "var(--color-canvas-soft)",
                    borderRadius: 9999,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${score}%`,
                      background: scoreColor,
                      borderRadius: 9999,
                      transition: "width 600ms ease",
                    }}
                  />
                </div>
                <p
                  className="body-md"
                  style={{ color: "var(--color-ink-mute)" }}
                >
                  {ruleData.summary}
                </p>

                {/* Insights list */}
                {ruleData.insights?.length > 0 && (
                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {ruleData.insights.map((ins: any, i: number) => (
                      <div
                        key={i}
                        className={`alert ${SEVERITY_STYLE[ins.severity] ?? "alert-info"}`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <p style={{ fontWeight: 400, fontSize: 14 }}>
                            {ins.title}
                          </p>
                          <span
                            className="micro-cap"
                            style={{
                              background: "white",
                              padding: "2px 6px",
                              borderRadius: 4,
                              opacity: 0.8,
                            }}
                          >
                            {ins.severity}
                          </span>
                        </div>
                        <p className="caption">{ins.message}</p>
                        <p className="caption" style={{ fontWeight: 450 }}>
                          Rekomendasi: {ins.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {ruleData.disclaimer && (
                  <p
                    className="micro"
                    style={{
                      marginTop: 16,
                      color: "var(--color-ink-mute)",
                      fontStyle: "italic",
                    }}
                  >
                    {ruleData.disclaimer}
                  </p>
                )}
              </div>
            )}

            {/* ── AI Insights ── */}
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <p className="heading-sm">AI Analysis</p>
                  <p
                    className="caption"
                    style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
                  >
                    Powered by Gemini
                  </p>
                </div>
                <button
                  id="refresh-ai-btn"
                  className="btn btn-primary btn-sm"
                  onClick={handleRefreshAI}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <svg
                        className="spin"
                        width="14"
                        height="14"
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
                      Generating…
                    </>
                  ) : (
                    "Generate AI insights"
                  )}
                </button>
              </div>

              {!aiData ? (
                <div className="empty-state" style={{ padding: "32px 0" }}>
                  <svg
                    className="empty-state-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                  <p
                    className="body-md"
                    style={{ color: "var(--color-ink)", marginBottom: 6 }}
                  >
                    No AI insights yet
                  </p>
                  <p
                    className="caption"
                    style={{ color: "var(--color-ink-mute)" }}
                  >
                    Add assets first, then click Generate to get AI-powered
                    analysis
                  </p>
                </div>
              ) : (
                <div
                  className="fade-in"
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Source */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      className={`pill-tag ${aiData.source === "fresh" ? "pill-tag-green" : "pill-tag-gray"}`}
                    >
                      {aiData.source === "fresh"
                        ? "Fresh"
                        : aiData.source === "cache"
                          ? "Cached"
                          : "Unavailable"}
                    </span>
                    {aiData.cached_at && (
                      <span
                        className="micro"
                        style={{ color: "var(--color-ink-mute)" }}
                      >
                        {new Date(aiData.cached_at).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  {/* Overall Recommendation Summary Block (Reference: Soft Green Highlight Box) */}
                  {aiData.summary && (
                    <div
                      className="insight-overall-summary-v5"
                      style={{
                        padding: 16,
                        backgroundColor: "#ecfdf5",
                        borderRadius: "var(--rounded-md)",
                        border: "1px solid #bbf7d0",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 550, color: "#065f46" }}>Overall Recommendation</span>
                        <span className="pill-tag pill-tag-green" style={{ fontSize: 9, textTransform: "uppercase", padding: "1px 8px", height: "18px" }}>Approve</span>
                      </div>
                      <p
                        className="body-md"
                        style={{ color: "#065f46", lineHeight: 1.5, fontWeight: 400 }}
                      >
                        {aiData.summary}
                      </p>
                    </div>
                  )}

                  {/* Vertically Stacked Analysis Blocks (Reference: Segmented List with Pill Badges) */}
                  {aiData.detailed_analysis && (
                    <div
                      className="card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px 18px",
                        gap: 18,
                        backgroundColor: "var(--color-canvas)"
                      }}
                    >
                      {[
                        {
                          key: "strengths",
                          title: "Portfolio Strengths",
                          badge: "Optimal",
                          badgeClass: "pill-tag-green",
                          bulletColor: "#10b981",
                          hasBorder: true
                        },
                        {
                          key: "weaknesses",
                          title: "Portfolio Weaknesses",
                          badge: "Attention",
                          badgeClass: "pill-tag-red",
                          bulletColor: "#ef4444",
                          hasBorder: true
                        },
                        {
                          key: "opportunities",
                          title: "Portfolio Opportunities",
                          badge: "Growth Potential",
                          badgeClass: "pill-tag-blue",
                          bulletColor: "#3b82f6",
                          hasBorder: true
                        },
                        {
                          key: "threats",
                          title: "Portfolio Threats",
                          badge: "Risk Alert",
                          badgeClass: "pill-tag-amber",
                          bulletColor: "#f59e0b",
                          hasBorder: false
                        },
                      ]
                        .filter((s) => aiData.detailed_analysis[s.key]?.length)
                        .map((s) => (
                          <div
                            key={s.key}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              paddingBottom: s.hasBorder ? 18 : 0,
                              borderBottom: s.hasBorder ? "1px solid var(--color-hairline)" : "none"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <h4 style={{ fontSize: 13.5, fontWeight: 550, color: "var(--color-ink)" }}>{s.title}</h4>
                              <span className={`pill-tag ${s.badgeClass}`} style={{ fontSize: 9, padding: "1px 6px", height: "16px" }}>{s.badge}</span>
                            </div>
                            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                              {aiData.detailed_analysis[s.key].map(
                                (item: string, i: number) => (
                                  <li key={i} style={{ fontSize: 13, color: "var(--color-ink-secondary)", lineHeight: 1.5 }}>
                                    <span style={{ color: s.bulletColor, marginRight: 6, fontSize: 12 }}>•</span>
                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Action Plan (Reference: clean step-by-step list) */}
                  {aiData.action_plan?.length > 0 && (
                    <div className="action-plan-card-v5">
                      <p
                        className="micro-cap"
                        style={{
                          color: "var(--color-ink)",
                          fontWeight: 500,
                          marginBottom: 16,
                        }}
                      >
                        Action Plan
                      </p>
                      <ul className="action-plan-list-v5">
                        {aiData.action_plan.map((item: string, i: number) => (
                          <li key={i} className="action-plan-item-v5">
                            <span className="action-plan-step-num-v5">
                              {i + 1}
                            </span>
                            <span
                              className="body-md"
                              style={{ color: "var(--color-ink-secondary)", lineHeight: 1.5 }}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk (Reference: risk assessment note) */}
                  {aiData.risk_assessment && (
                    <div
                      style={{
                        padding: 16,
                        background: "var(--color-canvas-soft)",
                        borderRadius: "var(--rounded-md)",
                        border: "1px solid var(--color-hairline)",
                        borderLeft: "4px solid var(--color-ink-mute)",
                      }}
                    >
                      <p
                        className="micro-cap"
                        style={{
                          color: "var(--color-ink-mute)",
                          marginBottom: 8,
                        }}
                      >
                        Risk Assessment
                      </p>
                      <p
                        className="body-md"
                        style={{ color: "var(--color-ink-secondary)", lineHeight: 1.5 }}
                      >
                        {aiData.risk_assessment}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
