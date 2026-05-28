import React, { useEffect, useMemo, useState } from "react";
import { AppShell, AssetLogo } from "../components";
import { getPerformanceAnalytics, getSummary } from "../api";
import {
  AreaChart,
  Area,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ASSET_COLORS, ASSET_LABELS } from "../lib/constants";
import { formatMoney, formatQuantity } from "../lib/format";

const PERIODS = ["7d", "30d", "90d", "1y", "all"] as const;
type Period = (typeof PERIODS)[number];

type AssetPoint = {
  date: string;
  price: string;
  current_value_idr: string;
  roi: string;
  period_return_percentage: string | null;
  position_return_percentage: string | null;
};

type PerformanceAsset = {
  asset_id: string;
  symbol: string;
  asset_name: string;
  asset_type: string;
  currency: string;
  quantity: string;
  avg_buy_price: string;
  current_price: string;
  current_value: string;
  current_value_idr: string;
  unrealized_pnl_idr: string;
  roi: string;
  daily_change_percentage: string | null;
  period_return_percentage: string | null;
  position_return_percentage: string | null;
  weight_percentage: string;
  data: AssetPoint[];
};

type PerformanceAnalytics = {
  period: Period;
  portfolio: {
    data: Array<{
      date: string;
      total_value: string;
      return_percentage: string | null;
    }>;
    change: string | null;
    change_percentage: string | null;
  };
  assets: PerformanceAsset[];
  movers: {
    winners: PerformanceAsset[];
    losers: PerformanceAsset[];
  };
  summary: {
    total_invested: string;
    current_value: string;
    total_unrealized_pnl: string;
    average_roi: string;
    asset_count: number;
  };
};

const ASSET_LINE_COLORS = [
  "#533afd",
  "#ea2261",
  "#0ea5e9",
  "#10b981",
  "#d97706",
  "#7c3aed",
  "#475569",
  "#f96bee",
];

const Skeleton: React.FC<{
  h?: number;
  w?: string;
  style?: React.CSSProperties;
}> = ({ h = 20, w = "100%", style }) => (
  <div className="skeleton" style={{ height: h, width: w, ...style }} />
);

export const getAssetIconSvg = (type: string) => {
  switch (type) {
    case "crypto":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M9 9h6M9 15h6" />
        </svg>
      );
    case "stock_id":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-ink-red)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <path d="M3 10l6-6 6 6 6-6" />
        </svg>
      );
    case "stock_us":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      );
    case "gold":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h12l4 6-10 12L2 9z" />
          <path d="M11 3 8 9l4 12 4-12-3-6" />
          <path d="M2 9h20" />
        </svg>
      );
    case "cash":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    default:
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-ink-mute)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
  }
};

const signedPercent = (value: string | number | null | undefined) => {
  const n = Number(value ?? 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

const getReturnColor = (value: string | number | null | undefined) =>
  Number(value ?? 0) >= 0 ? "var(--color-ink-green)" : "var(--color-ink-red)";

const shortDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

const compactPercent = (value: number | string) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1000) return `${(n / 1000).toFixed(abs >= 10000 ? 0 : 1)}k%`;
  return `${n.toFixed(abs >= 100 ? 0 : 1)}%`;
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
};

type InsightItem = {
  label: string;
  value: string;
  color?: string;
};

type AllocationViewItem = {
  asset_type: string;
  value: string;
  percentage: string;
};

const normalizeAllocationsByType = (
  allocations: Array<{ asset_type: string; value: string | number }>,
): AllocationViewItem[] => {
  const byType = new Map<string, number>();

  allocations.forEach((allocation) => {
    const value = Number(allocation.value ?? 0);
    byType.set(
      allocation.asset_type,
      (byType.get(allocation.asset_type) ?? 0) + value,
    );
  });

  const total = Array.from(byType.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  return Array.from(byType.entries())
    .map(([assetType, value]) => ({
      asset_type: assetType,
      value: String(value),
      percentage: total > 0 ? String((value / total) * 100) : "0",
    }))
    .sort((a, b) => Number(b.value) - Number(a.value));
};

const ChartTooltip = ({ active, payload, label, suffix }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="card card-sm"
      style={{ padding: "8px 12px", minWidth: 140 }}
    >
      <p
        className="caption"
        style={{ color: "var(--color-ink-mute)", marginBottom: 4 }}
      >
        {label}
      </p>
      {payload.map((item: any) => (
        <div
          key={item.dataKey}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span className="caption" style={{ color: item.color }}>
            {item.name}
          </span>
          <span
            className="caption tabular"
            style={{ color: "var(--color-ink)" }}
          >
            {Number(item.value).toFixed(2)}%
          </span>
        </div>
      ))}
      {suffix && (
        <p
          className="micro"
          style={{ color: "var(--color-ink-mute)", marginTop: 4 }}
        >
          {suffix}
        </p>
      )}
    </div>
  );
};

const MoneyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div
      className="card card-sm"
      style={{ padding: "8px 12px", minWidth: 150 }}
    >
      <p
        className="caption"
        style={{ color: "var(--color-ink-mute)", marginBottom: 2 }}
      >
        {label}
      </p>
      <p className="caption tabular" style={{ color: "var(--color-ink)" }}>
        {formatMoney(item.payload.totalValue, "IDR")}
      </p>
      <p
        className="caption tabular"
        style={{ color: getReturnColor(item.value) }}
      >
        {signedPercent(item.value)}
      </p>
    </div>
  );
};

const AssetSparklineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const currency = point?.currency ?? "IDR";

  return (
    <div
      className="card card-sm"
      style={{ padding: "8px 12px", minWidth: 160 }}
    >
      <p
        className="caption"
        style={{ color: "var(--color-ink-mute)", marginBottom: 6 }}
      >
        {label}
      </p>
      <div style={{ display: "grid", gap: 3 }}>
        <p className="caption tabular" style={{ color: "var(--color-ink)" }}>
          Price: {formatMoney(point?.price ?? 0, currency)}
        </p>
        <p
          className="caption tabular"
          style={{ color: "var(--color-ink-mute)" }}
        >
          Avg Buy: {formatMoney(point?.avgBuyPrice ?? 0, currency)}
        </p>
        <p
          className="caption tabular"
          style={{ color: getReturnColor(point?.value) }}
        >
          Return: {signedPercent(point?.value ?? 0)}
        </p>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [performanceAnalytics, setPerformanceAnalytics] =
    useState<PerformanceAnalytics | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleAssets, setVisibleAssets] = useState<Record<string, boolean>>(
    {},
  );
  const isMobile = useMediaQuery("(max-width: 640px)");

  const assets = performanceAnalytics?.assets ?? [];
  const perfSummary =
    performanceAnalytics?.summary ?? summary?.performance?.summary;

  useEffect(() => {
    loadAll();
  }, []);
  useEffect(() => {
    loadAnalytics(period);
  }, [period]);

  useEffect(() => {
    if (!assets.length) return;

    setVisibleAssets((current) => {
      const next = { ...current };
      assets.forEach((asset, index) => {
        if (next[asset.asset_id] === undefined) {
          next[asset.asset_id] = index < 6;
        }
      });
      return next;
    });
  }, [assets]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryData, analyticsData] = await Promise.all([
        getSummary(),
        getPerformanceAnalytics(period),
      ]);
      const performanceData =
        period === "30d" ? analyticsData : await getPerformanceAnalytics("30d");
      setSummary(summaryData);
      setAnalytics(analyticsData);
      setPerformanceAnalytics(performanceData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (selectedPeriod: Period) => {
    if (!analytics) return;
    setAnalyticsLoading(true);
    try {
      setAnalytics(await getPerformanceAnalytics(selectedPeriod));
    } catch {
      // Keep the last good chart data visible.
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const netWorth = summary?.net_worth;
  const allocs = useMemo<AllocationViewItem[]>(() => {
    if (assets.length > 0) {
      return normalizeAllocationsByType(
        assets.map((asset) => ({
          asset_type: asset.asset_type,
          value: asset.current_value_idr,
        })),
      );
    }

    return normalizeAllocationsByType(summary?.allocation?.allocations ?? []);
  }, [assets, summary?.allocation?.allocations]);

  const pieData = allocs.map((a) => ({
    name: ASSET_LABELS[a.asset_type] ?? a.asset_type,
    value: Number(a.value),
    type: a.asset_type,
  }));

  const portfolioData = useMemo(() => {
    const points = analytics?.portfolio?.data ?? [];
    return points.map((point) => ({
      date: shortDate(point.date),
      returnValue: Number(point.return_percentage ?? 0),
      totalValue: Number(point.total_value),
    }));
  }, [analytics]);

  const buildAssetChartData = (
    metric: "period_return_percentage" | "position_return_percentage",
  ) => {
    const rows = new Map<string, Record<string, string | number>>();

    assets.forEach((asset) => {
      asset.data.forEach((point) => {
        const key = point.date;
        const row = rows.get(key) ?? { date: shortDate(point.date) };
        row[asset.asset_id] = Number(point[metric] ?? 0);
        rows.set(key, row);
      });
    });

    return Array.from(rows.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([, row]) => row);
  };

  const marketChartData = useMemo(
    () => buildAssetChartData("period_return_percentage"),
    [assets],
  );

  const assetColor = (assetId: string) => {
    const index = assets.findIndex((asset) => asset.asset_id === assetId);
    return ASSET_LINE_COLORS[index % ASSET_LINE_COLORS.length];
  };

  const visibleAssetList = assets.filter(
    (asset) => visibleAssets[asset.asset_id],
  );
  const portfolioChange = analytics?.portfolio?.change_percentage;
  const totalPnl = Number(perfSummary?.total_unrealized_pnl ?? 0);
  const averageRoi = Number(perfSummary?.average_roi ?? 0);

  const sortedByPeriodReturn = [...assets].sort(
    (a, b) =>
      Number(b.period_return_percentage ?? 0) -
      Number(a.period_return_percentage ?? 0),
  );
  const bestMarketMover = sortedByPeriodReturn[0];
  const worstMarketMover =
    sortedByPeriodReturn[sortedByPeriodReturn.length - 1];

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="heading-md" style={{ color: "var(--color-ink)" }}>
            Dashboard
          </h1>
          <p
            className="caption"
            style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
          >
            Portfolio overview real-time
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadAll}>
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

      <div className="page-body dashboard-page">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        <div className="dashboard-stat-grid">
          <div className="stat-card">
            <p className="stat-label">Total Modal</p>
            {loading ? (
              <Skeleton h={38} />
            ) : (
              <>
                <p className="stat-value">
                  {formatMoney(perfSummary?.total_invested ?? 0, "IDR")}
                </p>
                <p
                  className="stat-change"
                  style={{ color: "var(--color-ink-mute)" }}
                >
                  Invested capital
                </p>
              </>
            )}
          </div>

          <div className="stat-card">
            <p className="stat-label">Total Net Worth</p>
            {loading ? (
              <>
                <Skeleton h={38} w="60%" style={{ marginBottom: 8 }} />
                <Skeleton h={16} w="40%" />
              </>
            ) : (
              <>
                <p className="stat-value">
                  {formatMoney(netWorth?.total ?? 0, "IDR")}
                </p>
                {portfolioChange !== null && portfolioChange !== undefined && (
                  <p
                    className="stat-change"
                    style={{ color: getReturnColor(portfolioChange) }}
                  >
                    {signedPercent(portfolioChange)} ({period})
                  </p>
                )}
              </>
            )}
          </div>

          <div className="stat-card">
            <p className="stat-label">Rata-rata Hasil Invest</p>
            {loading ? (
              <Skeleton h={38} />
            ) : (
              <>
                <p
                  className="stat-value"
                  style={{ color: getReturnColor(averageRoi) }}
                >
                  {signedPercent(averageRoi)}
                </p>
                <p
                  className="stat-change"
                  style={{ color: getReturnColor(totalPnl) }}
                >
                  {totalPnl >= 0 ? "+" : "-"}
                  {formatMoney(Math.abs(totalPnl), "IDR")}
                </p>
              </>
            )}
          </div>

          <div className="stat-card">
            <p className="stat-label">Asset Tracked</p>
            {loading ? (
              <Skeleton h={38} />
            ) : (
              <>
                <p className="stat-value">
                  {analytics?.summary?.asset_count ?? assets.length}
                </p>
                <p
                  className="stat-change"
                  style={{ color: "var(--color-ink-mute)" }}
                >
                  Portfolio assets
                </p>
              </>
            )}
          </div>
        </div>

        <div className="dashboard-chart-grid">
          <div className="card card-sm dashboard-chart-main">
            <div className="chart-panel-header">
              <div>
                <p className="heading-sm">Portfolio Performance</p>
                <p
                  className="caption"
                  style={{
                    color: getReturnColor(analytics?.portfolio?.change),
                    marginTop: 2,
                  }}
                >
                  {analytics?.portfolio?.change
                    ? `${Number(analytics.portfolio.change) >= 0 ? "+" : "-"}${formatMoney(Math.abs(Number(analytics.portfolio.change)), "IDR")}`
                    : formatMoney(0, "IDR")}
                </p>
              </div>
              <div className="period-tabs">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={
                      period === p
                        ? "btn btn-primary btn-sm"
                        : "btn btn-secondary btn-sm"
                    }
                    style={{ padding: "4px 10px", fontSize: 12 }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {loading || analyticsLoading ? (
              <Skeleton h={260} />
            ) : portfolioData.length === 0 ? (
              <div className="empty-state dashboard-empty">
                <p className="body-md">No portfolio data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
                <AreaChart
                  data={portfolioData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="portfolioReturnGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#533afd"
                        stopOpacity={0.18}
                      />
                      <stop offset="95%" stopColor="#533afd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#e3e8ee"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748d" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={isMobile ? 28 : 16}
                  />
                  <YAxis
                    hide={isMobile}
                    tick={{ fontSize: 11, fill: "#64748d" }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={compactPercent}
                  />
                  <Tooltip content={<MoneyTooltip />} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 3" />
                  <Area
                    type="monotone"
                    dataKey="returnValue"
                    name="Portfolio"
                    stroke="#533afd"
                    strokeWidth={2}
                    fill="url(#portfolioReturnGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#533afd" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card card-sm">
            <p className="heading-sm" style={{ marginBottom: 4 }}>
              Allocation
            </p>
            <p
              className="caption"
              style={{ color: "var(--color-ink-mute)", marginBottom: 16 }}
            >
              Portfolio breakdown
            </p>
            {loading ? (
              <Skeleton h={172} />
            ) : pieData.length === 0 ? (
              <div className="empty-state" style={{ padding: "36px 0" }}>
                <p className="caption">No assets</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={66}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.type}
                          fill={ASSET_COLORS[entry.type] ?? "#b9b9f9"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [
                        formatMoney(Number(val ?? 0), "IDR"),
                        "",
                      ]}
                      contentStyle={{
                        background: "var(--color-canvas)",
                        border: "1px solid var(--color-hairline)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  {allocs.map((a) => (
                    <div
                      key={a.asset_type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: ASSET_COLORS[a.asset_type] ?? "#b9b9f9",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          className="caption"
                          style={{ color: "var(--color-ink-secondary)" }}
                        >
                          {ASSET_LABELS[a.asset_type] ?? a.asset_type}
                        </span>
                      </div>
                      <span className="caption tabular">
                        {Number(a.percentage).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <AssetSparklinePanel
          assets={assets}
          loading={loading || analyticsLoading}
        />

        <div className="movers-wide-grid">
          <MoverList
            title="Top Performance"
            assets={analytics?.movers?.winners ?? []}
          />
          <MoverList
            title="Under Performance"
            assets={analytics?.movers?.losers ?? []}
          />
        </div>

        <PerformanceLinePanel
          variant="market"
          title="Market Performance"
          subtitle="Period return based on first market price, last 30 days"
          assets={assets}
          chartData={marketChartData}
          visibleAssets={visibleAssets}
          setVisibleAssets={setVisibleAssets}
          visibleAssetList={visibleAssetList}
          assetColor={assetColor}
          loading={loading || analyticsLoading}
          tooltipSuffix="vs period start"
          insights={[
            {
              label: "Best mover",
              value: bestMarketMover
                ? `${bestMarketMover.symbol} ${signedPercent(bestMarketMover.period_return_percentage)}`
                : "-",
              color: getReturnColor(bestMarketMover?.period_return_percentage),
            },
            {
              label: "Worst mover",
              value: worstMarketMover
                ? `${worstMarketMover.symbol} ${signedPercent(worstMarketMover.period_return_percentage)}`
                : "-",
              color: getReturnColor(worstMarketMover?.period_return_percentage),
            },
            {
              label: "Baseline",
              value: "Period start",
              color: "var(--color-ink-secondary)",
            },
          ]}
        />

        <div className="card table-card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--color-hairline)",
            }}
          >
            <p className="heading-sm">Asset Detail</p>
          </div>
          {loading ? (
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={40} />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="empty-state">
              <svg
                className="empty-state-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <p className="body-md">No assets tracked yet.</p>
              <a
                href="/assets"
                className="btn btn-primary btn-sm"
                style={{ marginTop: 12, textDecoration: "none" }}
              >
                Add your first asset
              </a>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="sw-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th style={{ textAlign: "right" }}>Quantity</th>
                    <th style={{ textAlign: "right" }}>Current Price</th>
                    <th style={{ textAlign: "right" }}>Current Value</th>
                    <th style={{ textAlign: "right" }}>Daily</th>
                    <th style={{ textAlign: "right" }}>Return</th>
                    <th style={{ textAlign: "right" }}>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const roi = Number(asset.roi);
                    const daily = asset.daily_change_percentage;
                    const currency = asset.currency || "IDR";

                    return (
                      <tr key={asset.asset_id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <AssetLogo
                              symbol={asset.symbol}
                              assetType={asset.asset_type}
                              size={32}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 400,
                                  color: "var(--color-ink)",
                                }}
                              >
                                {asset.asset_name}
                              </div>
                              <div
                                className="micro"
                                style={{
                                  color: "var(--color-ink-mute)",
                                  marginTop: 1,
                                }}
                              >
                                {asset.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={assetTypePill(asset.asset_type)}>
                            {ASSET_LABELS[asset.asset_type] ?? asset.asset_type}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular">
                          {formatQuantity(asset.quantity, asset.asset_type)}
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular">
                          {formatMoney(asset.current_price, currency)}
                          {asset.asset_type === "gold" ? "/g" : ""}
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular">
                          {formatMoney(asset.current_value, currency)}
                          {currency === "USD" && (
                            <span
                              className="micro"
                              style={{
                                color: "var(--color-ink-mute)",
                                display: "block",
                              }}
                            >
                              {formatMoney(asset.current_value_idr, "IDR")}
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular">
                          <span
                            className={`pill-tag ${Number(daily ?? 0) >= 0 ? "pill-tag-green" : "pill-tag-red"}`}
                          >
                            {daily === null ? "-" : signedPercent(daily)}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular">
                          <span
                            className={`pill-tag ${roi >= 0 ? "pill-tag-green" : "pill-tag-red"}`}
                          >
                            {signedPercent(roi)}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className="tabular">
                          <span className="pill-tag pill-tag-blue">
                            {Number(asset.weight_percentage).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
};

const assetTypePill = (assetType: string) => {
  switch (assetType) {
    case "crypto":
      return "pill-tag pill-tag-purple";
    case "stock_id":
      return "pill-tag pill-tag-green";
    case "stock_us":
      return "pill-tag pill-tag-blue";
    case "gold":
      return "pill-tag pill-tag-amber";
    case "cash":
      return "pill-tag pill-tag-gray";
    default:
      return "pill-tag";
  }
};


const PerformanceLinePanel: React.FC<{
  variant: "position" | "market";
  title: string;
  subtitle: string;
  assets: PerformanceAsset[];
  chartData: Record<string, string | number>[];
  visibleAssets: Record<string, boolean>;
  setVisibleAssets: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  visibleAssetList: PerformanceAsset[];
  assetColor: (assetId: string) => string;
  loading: boolean;
  tooltipSuffix: string;
  insights: InsightItem[];
}> = ({
  variant,
  title,
  subtitle,
  assets,
  chartData,
  visibleAssets,
  setVisibleAssets,
  visibleAssetList,
  assetColor,
  loading,
  tooltipSuffix,
  insights,
}) => (
  <div
    className={`card card-sm dashboard-full-chart performance-panel performance-panel-${variant}`}
  >
    <div className="chart-panel-header">
      <div>
        <p className="heading-sm">{title}</p>
        <p
          className="caption"
          style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
        >
          {subtitle} - {visibleAssetList.length} of {assets.length} assets
        </p>
      </div>
      <div className="performance-insights">
        {insights.map((item) => (
          <div key={item.label} className="performance-insight">
            <p className="micro-cap" style={{ color: "var(--color-ink-mute)" }}>
              {item.label}
            </p>
            <p
              className="caption tabular"
              style={{ color: item.color ?? "var(--color-ink)" }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>

    {loading ? (
      <Skeleton h={300} />
    ) : assets.length === 0 ? (
      <div className="empty-state dashboard-empty">
        <p className="body-md">No assets tracked yet.</p>
        <a
          href="/assets"
          className="btn btn-primary btn-sm"
          style={{ marginTop: 12, textDecoration: "none" }}
        >
          Add your first asset
        </a>
      </div>
    ) : (
      <>
        <div className="asset-toggle-row">
          <button
            type="button"
            className="asset-toggle asset-toggle-action"
            onClick={() =>
              setVisibleAssets(
                Object.fromEntries(
                  assets.map((asset) => [asset.asset_id, false]),
                ),
              )
            }
          >
            Reset all
          </button>
          <button
            type="button"
            className="asset-toggle asset-toggle-action"
            onClick={() =>
              setVisibleAssets(
                Object.fromEntries(
                  assets.map((asset) => [asset.asset_id, true]),
                ),
              )
            }
          >
            Show all
          </button>
          {assets.map((asset) => (
            <button
              type="button"
              key={asset.asset_id}
              className={
                visibleAssets[asset.asset_id]
                  ? "asset-toggle active"
                  : "asset-toggle"
              }
              onClick={() =>
                setVisibleAssets((current) => ({
                  ...current,
                  [asset.asset_id]: !current[asset.asset_id],
                }))
              }
              style={{ borderColor: assetColor(asset.asset_id) }}
            >
              <span style={{ background: assetColor(asset.asset_id) }} />
              {asset.symbol}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#e3e8ee"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748d" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748d" }}
              tickLine={false}
              axisLine={false}
              width={34}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<ChartTooltip suffix={tooltipSuffix} />} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 3" />
            {visibleAssetList.map((asset) => (
              <Line
                key={asset.asset_id}
                type="monotone"
                dataKey={asset.asset_id}
                name={asset.symbol}
                stroke={assetColor(asset.asset_id)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: assetColor(asset.asset_id) }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </>
    )}
  </div>
);

const AssetSparklinePanel: React.FC<{
  assets: PerformanceAsset[];
  loading: boolean;
}> = ({ assets, loading }) => {
  const sortedAssets = [...assets].sort(
    (a, b) =>
      Number(b.position_return_percentage ?? 0) -
      Number(a.position_return_percentage ?? 0),
  );
  const bestAsset = sortedAssets[0];
  const worstAsset = sortedAssets[sortedAssets.length - 1];

  return (
    <div className="card card-sm dashboard-full-chart performance-panel performance-panel-position">
      <div className="chart-panel-header">
        <div>
          <p className="heading-sm">Your Asset Performance</p>
          <p
            className="caption"
            style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
          >
            Based on your average buy price, last 30 days
          </p>
        </div>
        <div className="performance-insights">
          <div className="performance-insight">
            <p className="micro-cap" style={{ color: "var(--color-ink-mute)" }}>
              Best asset
            </p>
            <p
              className="caption tabular"
              style={{
                color: getReturnColor(bestAsset?.position_return_percentage),
              }}
            >
              {bestAsset
                ? `${bestAsset.symbol} ${signedPercent(bestAsset.position_return_percentage)}`
                : "-"}
            </p>
          </div>
          <div className="performance-insight">
            <p className="micro-cap" style={{ color: "var(--color-ink-mute)" }}>
              Worst asset
            </p>
            <p
              className="caption tabular"
              style={{
                color: getReturnColor(worstAsset?.position_return_percentage),
              }}
            >
              {worstAsset
                ? `${worstAsset.symbol} ${signedPercent(worstAsset.position_return_percentage)}`
                : "-"}
            </p>
          </div>
          <div className="performance-insight">
            <p className="micro-cap" style={{ color: "var(--color-ink-mute)" }}>
              Baseline
            </p>
            <p
              className="caption tabular"
              style={{ color: "var(--color-ink-secondary)" }}
            >
              Avg buy
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton h={360} />
      ) : assets.length === 0 ? (
        <div className="empty-state dashboard-empty">
          <p className="body-md">No assets tracked yet.</p>
          <a
            href="/assets"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 12, textDecoration: "none" }}
          >
            Add your first asset
          </a>
        </div>
      ) : (
        <div className="market-sparkline-grid">
          {sortedAssets.map((asset, index) => {
            const change = Number(asset.position_return_percentage ?? 0);
            const color = change >= 0 ? "#10b981" : "#ea2261";
            const gradientId = `assetSparkline${index}`;
            const data = asset.data.map((point) => ({
              date: shortDate(point.date),
              value: Number(point.position_return_percentage ?? 0),
              price: Number(point.price),
              avgBuyPrice: Number(asset.avg_buy_price),
              currency: asset.currency,
            }));

            return (
              <div key={asset.asset_id} className="market-sparkline-card">
                <div className="market-sparkline-card-head">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minWidth: 0,
                    }}
                  >
                    <AssetLogo
                      symbol={asset.symbol}
                      assetType={asset.asset_type}
                      size={28}
                      borderRadius="var(--rounded-sm)"
                    />
                    <div style={{ minWidth: 0 }}>
                      <p
                        className="caption"
                        style={{
                          color: "var(--color-ink)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 600,
                        }}
                      >
                        {asset.symbol.replace(/\.JK$/i, "")}
                      </p>
                      <p
                        className="micro"
                        style={{ color: "var(--color-ink-mute)" }}
                      >
                        {formatMoney(asset.current_price, asset.currency)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`pill-tag ${change >= 0 ? "pill-tag-green" : "pill-tag-red"}`}
                  >
                    {signedPercent(change)}
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={86}>
                  <AreaChart
                    data={data}
                    margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={color}
                          stopOpacity={0.22}
                        />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<AssetSparklineTooltip />} />
                    <XAxis dataKey="date" hide />
                    <ReferenceLine
                      y={0}
                      stroke="#cbd5e1"
                      strokeDasharray="4 3"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#${gradientId})`}
                      dot={false}
                      activeDot={{ r: 3, fill: color }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MoverList: React.FC<{ title: string; assets: PerformanceAsset[] }> = ({
  title,
  assets,
}) => (
  <div className="card card-sm mover-card">
    <p className="heading-sm" style={{ marginBottom: 14 }}>
      {title}
    </p>
    {assets.length === 0 ? (
      <div className="empty-state" style={{ padding: "26px 0" }}>
        <p className="caption">No assets</p>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {assets.slice(0, 5).map((asset) => {
          const roi = Number(asset.roi);

          return (
            <div key={asset.asset_id} className="mover-row">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <AssetLogo
                  symbol={asset.symbol}
                  assetType={asset.asset_type}
                  size={32}
                  borderRadius="var(--rounded-sm)"
                />
                <div style={{ minWidth: 0 }}>
                  <p
                    className="caption"
                    style={{
                      color: "var(--color-ink)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {asset.symbol}
                  </p>
                  <p
                    className="micro"
                    style={{ color: "var(--color-ink-mute)" }}
                  >
                    {Number(asset.weight_percentage).toFixed(1)}% weight
                  </p>
                </div>
              </div>
              <span
                className={`pill-tag ${roi >= 0 ? "pill-tag-green" : "pill-tag-red"}`}
              >
                {signedPercent(roi)}
              </span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

