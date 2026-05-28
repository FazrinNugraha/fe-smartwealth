/**
 * Format helpers — currency, number, date
 *
 * Dipakai di seluruh aplikasi untuk konsistensi format display.
 * Aturan:
 *  - IDR → "Rp 1.234.567" (locale id-ID, tanpa desimal)
 *  - USD → "$ 1,234.56" (locale en-US, 2 desimal)
 *  - Quantity crypto: 8 desimal max
 *  - Quantity stock/cash: integer atau locale-formatted
 */

/**
 * Format angka dengan locale id-ID (default: integer)
 */
export const formatNumber = (n: number | string, decimals = 0): string =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(n));

/**
 * Format uang sesuai currency code
 *
 * @example
 *  formatMoney(1234567, 'IDR')   → "Rp 1.234.567"
 *  formatMoney(1234.56, 'USD')   → "$ 1,234.56"
 *  formatMoney(1000, 'EUR')      → "EUR 1,000"
 */
export const formatMoney = (
  value: number | string,
  currency: string = "IDR",
): string => {
  const n = Number(value);
  if (Number.isNaN(n)) return "-";

  if (currency === "USD") {
    return (
      "$ " +
      n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  if (currency === "IDR") {
    return "Rp " + Math.round(n).toLocaleString("id-ID");
  }
  // Generic fallback
  return currency + " " + n.toLocaleString();
};

/**
 * Get currency symbol (Rp, $, €, dll)
 */
export const currencySymbol = (currency: string = "IDR"): string => {
  const map: Record<string, string> = {
    IDR: "Rp",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    SGD: "S$",
  };
  return map[currency.toUpperCase()] ?? currency;
};

/**
 * Format quantity berdasarkan asset type
 *  - crypto    → up to 8 decimals
 *  - gold      → up to 2 decimals + " g"
 *  - stock_id  → integer + " lembar"
 *  - stock_us  → decimal + " shares"
 *  - cash      → currency-formatted (Rp / $ / dll)
 *  - lainnya   → integer
 */
export const formatQuantity = (
  value: number | string,
  assetType?: string,
  currency?: string,
): string => {
  const n = Number(value);
  if (Number.isNaN(n)) return "-";

  if (assetType === "crypto") {
    return n.toLocaleString("en-US", { maximumFractionDigits: 8 });
  }
  if (assetType === "gold") {
    return n.toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " g";
  }
  if (assetType === "stock_id") {
    return n.toLocaleString("id-ID") + " lembar";
  }
  if (assetType === "stock_us") {
    return n.toLocaleString("en-US", { maximumFractionDigits: 4 }) + " shares";
  }
  if (assetType === "cash") {
    const cur = (currency ?? "IDR").toUpperCase();
    if (cur === "IDR") return "Rp " + Math.round(n).toLocaleString("id-ID");
    if (cur === "USD")
      return (
        "$ " +
        n.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    return cur + " " + n.toLocaleString();
  }
  return n.toLocaleString("id-ID");
};

/**
 * Format date short (e.g., "12 Mei 2026")
 */
export const formatDate = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * Format datetime (e.g., "12 Mei 2026, 14:30")
 */
export const formatDateTime = (iso: string | Date): string =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
