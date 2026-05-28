/**
 * AssetLogo — Resolves and renders a real brand logo for any asset.
 *
 * Resolution strategy:
 *  • Priority 1: Clearbit & Google Favicons for overridden tickers in DOMAIN_LOOKUP (e.g. BBRI to avoid bad FMP images, WBSA for missing logos)
 *  • Priority 2: FMP Stock database (excellent coverage for most IDX and US equities like TLKM, BBCA, AAPL, NVDA)
 *  • Priority 3: Dynamic domain guessing (ticker.co.id or ticker.com)
 *  • Priority 4: Crypto GitHub CDN (from spothq/cryptocurrency-icons)
 *  • Priority 5: Instant custom SVG category-icon fallback (zero broken images)
 */

import React, { useState } from "react";

// ─── SVG Fallback Icons (one per asset type) ──────────────────────────────────

const FallbackIcon: React.FC<{ type: string; size: number }> = ({
  type,
  size,
}) => {
  const s = Math.round(size * 0.48);
  switch (type) {
    case "crypto":
      return (
        <svg
          width={s}
          height={s}
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
          width={s}
          height={s}
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
          width={s}
          height={s}
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
          width={s}
          height={s}
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
          width={s}
          height={s}
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
          width={s}
          height={s}
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

// ─── Crypto Tickers ───────────────────────────────────────────────────────────

const CRYPTO_TICKER: Record<string, string> = {
  bitcoin: "btc",
  ethereum: "eth",
  binancecoin: "bnb",
  solana: "sol",
  ripple: "xrp",
  cardano: "ada",
  dogecoin: "doge",
  polkadot: "dot",
  "avalanche-2": "avax",
  avalanche: "avax",
  chainlink: "link",
  "matic-network": "matic",
  polygon: "matic",
  uniswap: "uni",
  litecoin: "ltc",
  tron: "trx",
  stellar: "xlm",
  monero: "xmr",
  "internet-computer": "icp",
  near: "near",
  arbitrum: "arb",
  optimism: "op",
  aptos: "apt",
  "shiba-inu": "shib",
  "floki-inu": "floki",
  pepe: "pepe",
  btc: "btc",
  eth: "eth",
  bnb: "bnb",
  sol: "sol",
  xrp: "xrp",
  ada: "ada",
  doge: "doge",
  dot: "dot",
  avax: "avax",
  link: "link",
  matic: "matic",
  uni: "uni",
  ltc: "ltc",
  trx: "trx",
  xlm: "xlm",
  xmr: "xmr",
  icp: "icp",
  shib: "shib",
};

const GITHUB_CRYPTO_CDN =
  "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color";

// ─── Specific Overrides (Only for tickers with bad or missing images in FMP) ──

const DOMAIN_LOOKUP: Record<string, string> = {
  // Indonesian Stocks Overrides
  bbri: "bri.co.id", // Avoid bad FMP cartoon placeholder image
  wbsa: "bsa-logistics.co.id", // Missing in FMP database
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface AssetLogoProps {
  symbol: string;
  assetType: string;
  /** Outer container size in px (default 36) */
  size?: number;
  /** Border radius override */
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const AssetLogo: React.FC<AssetLogoProps> = ({
  symbol,
  assetType,
  size = 36,
  borderRadius = "var(--rounded-md)",
  style,
}) => {
  const [urlIndex, setUrlIndex] = useState(0);

  const candidateUrls = React.useMemo(() => {
    if (assetType === "gold" || assetType === "cash") {
      return [];
    }

    const urls: string[] = [];
    const cleanSymbol = symbol.toUpperCase().trim();
    const key = symbol.toLowerCase().replace(/\.jk$/i, "").trim();

    if (assetType === "crypto") {
      const ticker = CRYPTO_TICKER[key] ?? key;
      urls.push(`${GITHUB_CRYPTO_CDN}/${ticker}.png`);
      urls.push(`https://logo.clearbit.com/${ticker}.org`);
      urls.push(`https://logo.clearbit.com/${ticker}.com`);
      urls.push(
        `https://www.google.com/s2/favicons?sz=128&domain=${ticker}.org`,
      );
      return urls;
    }

    // Stocks
    const domain = DOMAIN_LOOKUP[key];
    const cleanTicker = cleanSymbol
      .replace(/\.JK$/i, "")
      .replace(/\.US$/i, "")
      .replace(/\.O$/i, "");

    // 1. If explicit override domain exists, prioritize its brand URLs first
    if (domain) {
      urls.push(`https://logo.clearbit.com/${domain}`);
      urls.push(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
    }

    // 2. Try the primary stock database (FMP) which has excellent correct images for most (like TLKM, BBCA, AAPL)
    if (assetType === "stock_id") {
      urls.push(
        `https://financialmodelingprep.com/image-stock/${cleanTicker}.JK.png`,
      );

      // 3. Fallbacks: Guess domains if FMP fails and it was not overridden
      if (!domain) {
        urls.push(
          `https://logo.clearbit.com/${cleanTicker.toLowerCase()}.co.id`,
        );
        urls.push(
          `https://www.google.com/s2/favicons?sz=128&domain=${cleanTicker.toLowerCase()}.co.id`,
        );
      }
    } else if (assetType === "stock_us") {
      urls.push(
        `https://financialmodelingprep.com/image-stock/${cleanTicker}.png`,
      );

      if (!domain) {
        urls.push(`https://logo.clearbit.com/${cleanTicker.toLowerCase()}.com`);
        urls.push(
          `https://www.google.com/s2/favicons?sz=128&domain=${cleanTicker.toLowerCase()}.com`,
        );
      }
    }

    return urls;
  }, [symbol, assetType]);

  const activeUrl = candidateUrls[urlIndex] || null;
  const showImage = !!activeUrl;
  const logoSize = Math.round(size * 0.72);

  const handleImgError = () => {
    setUrlIndex((prev) => prev + 1);
  };

  // Reset URL index when symbol or type changes
  React.useEffect(() => {
    setUrlIndex(0);
  }, [symbol, assetType]);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        background: showImage ? "#fff" : "var(--color-canvas-soft)",
        border: "1px solid var(--color-hairline)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {showImage ? (
        <img
          src={activeUrl!}
          alt={symbol}
          width={logoSize}
          height={logoSize}
          onError={handleImgError}
          style={{
            width: logoSize,
            height: logoSize,
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <FallbackIcon type={assetType} size={size} />
      )}
    </div>
  );
};
