/**
 * App-wide constants
 *
 * Single source of truth untuk asset types, labels, icons, dan colors.
 * Dipakai di Assets, Transactions, Dashboard, dan Insights.
 */

export type AssetType = "crypto" | "stock_id" | "stock_us" | "gold" | "cash";

export const ASSET_LABELS: Record<string, string> = {
  crypto: "Crypto",
  stock_id: "Saham ID",
  stock_us: "Saham US",
  gold: "Emas",
  cash: "Cash",
};

export const ASSET_ICONS: Record<string, string> = {
  crypto: "🪙",
  stock_id: "🇮🇩",
  stock_us: "🇺🇸",
  gold: "🥇",
  cash: "💵",
};

/** Warna chart per asset type (sesuai palette DESIGN.md) */
export const ASSET_COLORS: Record<string, string> = {
  crypto: "#533afd",
  stock_id: "#ea2261",
  stock_us: "#f96bee",
  gold: "#9b6829",
  cash: "#b9b9f9",
};

/** Currency yang didukung untuk Cash asset */
export const SUPPORTED_CURRENCIES = [
  { code: "IDR", label: "IDR — Rupiah", symbol: "Rp" },
  { code: "USD", label: "USD — US Dollar", symbol: "$" },
  { code: "EUR", label: "EUR — Euro", symbol: "€" },
  { code: "SGD", label: "SGD — Singapore Dollar", symbol: "S$" },
  { code: "GBP", label: "GBP — British Pound", symbol: "£" },
] as const;
