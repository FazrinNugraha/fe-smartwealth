import React, { useState } from "react";
import { AppShell } from "../components";
import { getStockPrediction } from "../api";
import type { StockPredictionResponse } from "../api";
import { formatMoney } from "../lib/format";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from "recharts";


const PREDICTION_HORIZONS = [1, 2, 3, 4, 5, 6, 7] as const;
const QUICK_TICKERS = ["BBCA", "BBRI", "TLKM", "BMRI", "ASII"] as const;

const signedPercent = (value: string | number | null | undefined) => {
  const n = Number(value ?? 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

const getReturnColor = (value: string | number | null | undefined) =>
  Number(value ?? 0) >= 0 ? "var(--color-ink-green)" : "var(--color-ink-red)";

const shortGeneratedAt = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const PredictionPage: React.FC = () => {
  const [ticker, setTicker] = useState("BBCA");
  const [horizon, setHorizon] = useState<number>(2);
  const [prediction, setPrediction] = useState<StockPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const cleanTicker = ticker.trim();
    if (!cleanTicker) {
      setError("Ticker saham wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setPrediction(await getStockPrediction(cleanTicker, horizon));
    } catch (err: any) {
      setPrediction(null);
      const message =
        err.code === "ECONNABORTED"
          ? "Prediksi melewati batas waktu. Coba lagi sebentar."
          : err.response?.data?.message || "Prediksi belum tersedia. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="heading-md" style={{ color: "var(--color-ink)" }}>
            Forecast
          </h1>
          <p
            className="caption"
            style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
          >
            Stock price range for IDX tickers
          </p>
        </div>
      </div>

      <div className="page-body prediction-page">
        <section className="card card-sm prediction-panel">
          <form className="prediction-toolbar" onSubmit={handleSubmit}>
            <div className="prediction-input-group prediction-input-main">
              <label className="micro-cap" htmlFor="prediction-ticker">
                Ticker
              </label>
              <input
                id="prediction-ticker"
                className="input prediction-input"
                list="prediction-quick-symbols"
                value={ticker}
                placeholder="BBCA"
                onChange={(event) => setTicker(event.target.value.toUpperCase())}
              />
              <datalist id="prediction-quick-symbols">
                {QUICK_TICKERS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="prediction-input-group prediction-input-horizon">
              <label className="micro-cap" htmlFor="prediction-horizon">
                Horizon
              </label>
              <select
                id="prediction-horizon"
                className="input prediction-input"
                value={horizon}
                onChange={(event) => setHorizon(Number(event.target.value))}
              >
                {PREDICTION_HORIZONS.map((days) => (
                  <option key={days} value={days}>
                    {days} day{days > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary prediction-submit" type="submit" disabled={loading}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m7 14 3-3 3 2 5-7" />
              </svg>
              {loading ? "Predicting" : "Predict"}
            </button>
          </form>

          <div className="asset-toggle-row prediction-quick-row">
            {QUICK_TICKERS.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  ticker.replace(/\.JK$/i, "").toUpperCase() === item
                    ? "asset-toggle active"
                    : "asset-toggle"
                }
                onClick={() => setTicker(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error prediction-alert">{error}</div>}

          {loading ? (
            <PredictionLoading />
          ) : prediction ? (
            <PredictionResult prediction={prediction} />
          ) : (
            <div className="prediction-empty-state">
              <div className="prediction-empty-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m7 14 3-3 3 2 5-7" />
                </svg>
              </div>
              <p className="body-md" style={{ color: "var(--color-ink)" }}>
                No forecast yet
              </p>
              <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
                Choose a ticker and horizon to generate a range estimate.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

const PredictionResult: React.FC<{ prediction: StockPredictionResponse }> = ({
  prediction,
}) => {
  const { lower, median, upper } = prediction.predicted_price;
  const lastClose = prediction.last_close;

  // Generate data untuk diagram proyeksi fan chart (5 titik dari harga terakhir hingga target)
  const horizon = prediction.horizon_days;
  const chartData = Array.from({ length: 5 }, (_, i) => {
    const ratio = i / 4;
    return {
      step: i === 0 ? "Hari Ini" : `Hari ${Math.round(horizon * ratio)}`,
      "Skenario Optimis (Upper)": Math.round(lastClose + (upper - lastClose) * ratio),
      "Skenario Utama (Median)": Math.round(lastClose + (median - lastClose) * ratio),
      "Skenario Pesimis (Lower)": Math.round(lastClose + (lower - lastClose) * ratio),
    };
  });

  return (
    <div className="prediction-result-v3">
      {/* 1. Premium Header Card (Headline + Metadata Row) */}
      <div className="card forecast-header-card-v5">
        {/* Top: Headline Harga Besar */}
        <div className="forecast-headline-v5">
          <div className="prediction-symbol-row" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="prediction-symbol" style={{ fontSize: 16, fontWeight: 500, color: "var(--color-ink-secondary)" }}>
              {prediction.ticker}
            </span>
            <span className={`pill-tag ${directionPill(prediction.direction)}`} style={{ textTransform: "uppercase", fontSize: 10 }}>
              {prediction.direction}
            </span>
          </div>
          <span className="base-price-label" style={{ display: "block", marginBottom: 2 }}>Proyeksi Base Case (Median)</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <p className="prediction-price tabular" style={{ fontSize: 44, fontWeight: 300, color: "var(--color-ink)", lineHeight: 1.05 }}>
              {formatMoney(median, "IDR")}
            </p>
            <p
              className="prediction-change tabular"
              style={{
                color: getReturnColor(prediction.change_percent.median),
                fontSize: 15,
                fontWeight: 500
              }}
            >
              {signedPercent(prediction.change_percent.median)} vs last close
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="forecast-divider-v5" style={{ height: 1, backgroundColor: "var(--color-hairline)", margin: "20px 0" }} />

        {/* Bottom: Metadata Row (The horizontal border-separated row from the image) */}
        <div className="forecast-reference-row-v5">
          <div className="reference-item">
            <span className="ref-label">Harga Terakhir</span>
            <span className="ref-badge tabular">{formatMoney(lastClose, "IDR")}</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">Tanggal Proyeksi</span>
            <span className="ref-badge tabular">{prediction.prediction_date}</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">Waktu Pembuatan</span>
            <span className="ref-badge tabular">{shortGeneratedAt(prediction.generated_at)}</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">Status Data</span>
            <span className={`ref-badge tabular ${prediction.cached ? "badge-cached" : "badge-fresh"}`}>
              {prediction.cached ? "Cached" : "Terbaru (Fresh)"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Premium Dedicated Chart Card */}
      <div className="card forecast-chart-card-v5">
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
          <h3 className="chart-title-v5" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-ink)" }}>Jalur Proyeksi Target (Projection Fan)</h3>
          <p className="micro" style={{ color: "var(--color-ink-mute)" }}>Visualisasi lintasan harga proyeksi optimis, median, dan pesimis selama {prediction.horizon_days} hari ke depan</p>
        </div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="#e3e8ee" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="step" tick={{ fontSize: 11, fill: "#64748d" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748d" }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `Rp${v.toLocaleString("id-ID")}`}
              />
              <ChartTooltip
                formatter={(value: any) => [formatMoney(Number(value), "IDR"), ""]}
                contentStyle={{
                  background: "var(--color-canvas)",
                  border: "1px solid var(--color-hairline)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="Skenario Optimis (Upper)"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="Skenario Utama (Median)"
                stroke="#533afd"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: "#533afd" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Skenario Pesimis (Lower)"
                stroke="#ea2261"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Sleek Forecast Targets Table */}
      <div className="table-card forecast-table-card">
        <div className="table-header-v3">
          <h3 className="table-title-v3">Analisis Skenario Target Harga</h3>
        </div>
        <div className="table-scroll">
          <table className="sw-table forecast-table">
            <thead>
              <tr>
                <th style={{ width: "220px" }}>Skenario</th>
                <th style={{ width: "160px" }}>Harga Proyeksi</th>
                <th style={{ width: "140px" }}>Proyeksi Return</th>
                <th>Konteks Model</th>
              </tr>
            </thead>
            <tbody>
              {/* Upper Row */}
              <tr>
                <td>
                  <span className="pill-tag pill-tag-green">Optimis (Upper)</span>
                </td>
                <td className="tabular font-medium" style={{ color: "var(--color-ink)" }}>{formatMoney(upper, "IDR")}</td>
                <td className="tabular font-medium text-green">{signedPercent(prediction.change_percent.upper)}</td>
                <td className="caption" style={{ color: "var(--color-ink-mute)" }}>
                  Batas atas perkiraan harga target dengan potensi pertumbuhan maksimal.
                </td>
              </tr>
              {/* Median Row (Highlighted) */}
              <tr className="row-highlight-median">
                <td>
                  <span className="pill-tag pill-tag-purple">Utama (Median)</span>
                </td>
                <td className="tabular font-semibold" style={{ color: "var(--color-primary)" }}>{formatMoney(median, "IDR")}</td>
                <td className="tabular font-semibold" style={{ color: getReturnColor(prediction.change_percent.median) }}>
                  {signedPercent(prediction.change_percent.median)}
                </td>
                <td className="caption font-medium" style={{ color: "var(--color-ink-secondary)" }}>
                  Target paling realistis dan berprobabilitas tinggi menurut model statistik.
                </td>
              </tr>
              {/* Lower Row */}
              <tr>
                <td>
                  <span className="pill-tag pill-tag-red">Pesimis (Lower)</span>
                </td>
                <td className="tabular font-medium" style={{ color: "var(--color-ink)" }}>{formatMoney(lower, "IDR")}</td>
                <td className="tabular font-medium text-red">{signedPercent(prediction.change_percent.lower)}</td>
                <td className="caption" style={{ color: "var(--color-ink-mute)" }}>
                  Batas bawah pengujian risiko jika terjadi sentimen pasar negatif.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Elegant Minimal Disclaimer */}
      <div className="forecast-disclaimer-minimal">
        <p className="caption" style={{ color: "var(--color-ink-mute)", lineHeight: 1.5 }}>
          * {prediction.disclaimer}
        </p>
      </div>
    </div>
  );
};

const PredictionLoading: React.FC = () => (
  <div className="prediction-result-v3">
    {/* Headline + Metadata Card Skeleton */}
    <div className="card forecast-header-card-v5">
      {/* Headline skeleton */}
      <div className="forecast-headline-v5">
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div className="skeleton" style={{ height: 24, width: 80, borderRadius: "var(--rounded-md)" }} />
          <div className="skeleton" style={{ height: 20, width: 90, borderRadius: "var(--rounded-pill)" }} />
        </div>
        <div className="skeleton" style={{ height: 12, width: 140, marginBottom: 8 }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div className="skeleton" style={{ height: 48, width: 220 }} />
          <div className="skeleton" style={{ height: 16, width: 120 }} />
        </div>
      </div>

      {/* Divider */}
      <div className="forecast-divider-v5" style={{ height: 1, backgroundColor: "var(--color-hairline)", margin: "20px 0" }} />

      {/* Metadata Row skeleton */}
      <div className="forecast-reference-row-v5">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="skeleton" style={{ height: 10, width: 70 }} />
            <div className="skeleton" style={{ height: 28, width: 100, borderRadius: "var(--rounded-md)" }} />
          </div>
        ))}
      </div>
    </div>

    {/* Chart Card Skeleton */}
    <div className="card forecast-chart-card-v5">
      <div className="skeleton" style={{ height: 16, width: 160, marginBottom: 4 }} />
      <div className="skeleton" style={{ height: 10, width: 240, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 260, width: "100%", borderRadius: "var(--rounded-md)" }} />
    </div>

    {/* Table Card Skeleton */}
    <div className="table-card forecast-table-card">
      <div className="skeleton" style={{ height: 48, width: "100%" }} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton" style={{ height: 44, width: "100%" }} />
        ))}
      </div>
    </div>
  </div>
);

const directionPill = (direction: StockPredictionResponse["direction"]) => {
  if (direction === "naik") return "pill-tag-green";
  if (direction === "turun") return "pill-tag-red";
  return "pill-tag-gray";
};

