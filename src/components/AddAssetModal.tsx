/**
 * AddAssetModal - Step-based modal for adding assets
 * Step 1: Choose asset type
 * Step 2: Fill form specific to that type (crypto, stock, gold, cash)
 */

import React, { useState, useEffect } from "react";
import { createAsset, getPrice, searchCrypto } from "../api";
import { SUPPORTED_CURRENCIES } from "../lib/constants";

interface AddAssetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AssetType = "crypto" | "stock_id" | "stock_us" | "gold" | "cash";

const ASSET_TYPES: { type: AssetType; label: string; desc: string }[] = [
  { type: "crypto", label: "Crypto", desc: "Bitcoin, Ethereum, BNB, dll" },
  {
    type: "stock_id",
    label: "Saham Indo",
    desc: "BBCA, TLKM, BBRI, GOTO, dll",
  },
  { type: "stock_us", label: "Saham US", desc: "AAPL, GOOGL, TSLA, MSFT, dll" },
  { type: "gold", label: "Emas", desc: "Emas Antam, Pegadaian, dll" },
  { type: "cash", label: "Cash", desc: "Tabungan, dompet, IDR/USD/EUR" },
];

// Same SVG icon set as DashboardPage — keep in sync
const getAssetIconSvg = (type: string) => {
  switch (type) {
    case "crypto":
      return (
        <svg
          width="20"
          height="20"
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
          width="20"
          height="20"
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
          width="20"
          height="20"
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
          width="20"
          height="20"
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
          width="20"
          height="20"
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
          width="20"
          height="20"
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

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);

  const handleSelectType = (type: AssetType) => {
    setSelectedType(type);
    setStep(2);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(13, 37, 61, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card fade-in"
        style={{
          width: "100%",
          maxWidth: step === 1 ? 520 : 560,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-hairline)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-ink-mute)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                ←
              </button>
            )}
            <div>
              <h2 className="heading-sm">Add asset</h2>
              <p
                className="caption"
                style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
              >
                {step === 1
                  ? "Step 1 of 2 — Choose type"
                  : `Step 2 of 2 — ${ASSET_TYPES.find((a) => a.type === selectedType)?.label}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-ink-mute)",
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {step === 1 && <TypeSelector onSelect={handleSelectType} />}
          {step === 2 && selectedType === "crypto" && (
            <CryptoForm onClose={onClose} onSuccess={onSuccess} />
          )}
          {step === 2 && selectedType === "stock_id" && (
            <StockIDForm onClose={onClose} onSuccess={onSuccess} />
          )}
          {step === 2 && selectedType === "stock_us" && (
            <StockUSForm onClose={onClose} onSuccess={onSuccess} />
          )}
          {step === 2 && selectedType === "gold" && (
            <GoldForm onClose={onClose} onSuccess={onSuccess} />
          )}
          {step === 2 && selectedType === "cash" && (
            <CashForm onClose={onClose} onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Step 1: Type Selector ─── */
const TypeSelector: React.FC<{ onSelect: (t: AssetType) => void }> = ({
  onSelect,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <p
      className="body-md"
      style={{ color: "var(--color-ink-mute)", marginBottom: 8 }}
    >
      What type of asset do you want to add?
    </p>
    {ASSET_TYPES.map((a) => (
      <button
        key={a.type}
        onClick={() => onSelect(a.type)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          border: "1px solid var(--color-hairline)",
          borderRadius: "var(--rounded-md)",
          background: "var(--color-canvas)",
          cursor: "pointer",
          textAlign: "left",
          transition: "border-color 120ms, background 120ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.background = "var(--color-canvas-soft)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-hairline)";
          e.currentTarget.style.background = "var(--color-canvas)";
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--rounded-md)",
            background: "var(--color-canvas-soft)",
            border: "1px solid var(--color-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {getAssetIconSvg(a.type)}
        </div>
        <div>
          <p
            className="body-md"
            style={{ fontWeight: 400, color: "var(--color-ink)" }}
          >
            {a.label}
          </p>
          <p
            className="caption"
            style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
          >
            {a.desc}
          </p>
        </div>
        <span style={{ marginLeft: "auto", color: "var(--color-ink-mute)" }}>
          →
        </span>
      </button>
    ))}
  </div>
);

/* ─── Shared hook: symbol validation ─── */
function useSymbolValidation(symbol: string, assetType: string) {
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [price, setPrice] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (symbol.length < 2) {
      setValid(null);
      setPrice("");
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setValidating(true);
      setValid(null);
      setPrice("");
      try {
        const data = await getPrice(symbol, assetType);
        const raw = parseFloat(data.price);
        const isIDR = ["stock_id", "gold"].includes(assetType);
        setPrice(isIDR ? Math.round(raw).toString() : raw.toFixed(2));
        setValid(true);
      } catch {
        setValid(false);
        if (assetType === "crypto") {
          try {
            const res = await searchCrypto(symbol, 5);
            setSuggestions(res.results || []);
          } catch {
            setSuggestions([]);
          }
        }
      } finally {
        setValidating(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [symbol, assetType]);

  return { validating, valid, price, suggestions, setSuggestions };
}

/* ─── Shared: Symbol input with validation indicator ─── */
const SymbolInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint: string;
  validating: boolean;
  valid: boolean | null;
  price: string;
  priceLabel: string;
  suggestions: any[];
  onSelectSuggestion: (s: any) => void;
  onUsePrice: () => void;
}> = ({
  value,
  onChange,
  placeholder,
  hint,
  validating,
  valid,
  price,
  priceLabel,
  suggestions,
  onSelectSuggestion,
  onUsePrice,
}) => (
  <div className="form-group">
    <label className="label">
      Symbol / Ticker
      {validating && (
        <span
          style={{ marginLeft: 8, color: "var(--color-primary)", fontSize: 12 }}
        >
          checking...
        </span>
      )}
      {valid === true && (
        <span style={{ marginLeft: 8, color: "#16a34a", fontSize: 12 }}>
          ✓ valid
        </span>
      )}
      {valid === false && (
        <span
          style={{ marginLeft: 8, color: "var(--color-ruby)", fontSize: 12 }}
        >
          ✗ not found
        </span>
      )}
    </label>
    <input
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      style={{
        borderColor:
          valid === true
            ? "#16a34a"
            : valid === false
              ? "var(--color-ruby)"
              : undefined,
      }}
    />
    <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
      {hint}
    </p>
    {price && (
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}
      >
        <span className="caption" style={{ color: "#16a34a" }}>
          ✓ {priceLabel} {parseFloat(price).toLocaleString("id-ID")}
        </span>
        <button
          type="button"
          onClick={onUsePrice}
          className="caption"
          style={{
            color: "var(--color-primary)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Use as buy price
        </button>
      </div>
    )}
    {suggestions.length > 0 && (
      <div
        style={{
          border: "1px solid var(--color-hairline)",
          borderRadius: 6,
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxHeight: 180,
          overflowY: "auto",
        }}
      >
        <p
          className="micro-cap"
          style={{
            padding: "6px 12px",
            borderBottom: "1px solid var(--color-hairline)",
            background: "var(--color-canvas-soft)",
          }}
        >
          Did you mean:
        </p>
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectSuggestion(s)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              border: "none",
              background: "white",
              cursor: "pointer",
              borderBottom:
                i < suggestions.length - 1
                  ? "1px solid var(--color-hairline)"
                  : "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-canvas-soft)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <span
              className="body-md"
              style={{ fontWeight: 400, color: "var(--color-primary)" }}
            >
              {s.name}
            </span>
            <span
              className="caption"
              style={{ color: "var(--color-ink-mute)", marginLeft: 8 }}
            >
              {s.id} · {s.symbol?.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
);

/* ─── Shared: Form footer ─── */
const FormFooter: React.FC<{
  onCancel: () => void;
  disabled: boolean;
  loading?: boolean;
}> = ({ onCancel, disabled, loading }) => (
  <div
    style={{
      display: "flex",
      gap: 10,
      marginTop: 24,
      paddingTop: 20,
      borderTop: "1px solid var(--color-hairline)",
    }}
  >
    <button type="submit" className="btn btn-primary" disabled={disabled}>
      {loading ? "Saving..." : "Save asset"}
    </button>
    <button type="button" className="btn btn-secondary" onClick={onCancel}>
      Cancel
    </button>
  </div>
);

/* ─── Form: Crypto ─── */
const CryptoForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { validating, valid, price, suggestions, setSuggestions } =
    useSymbolValidation(symbol, "crypto");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valid === false) return;
    setSaving(true);
    try {
      await createAsset({
        symbol,
        asset_name: name || symbol.toUpperCase(),
        asset_type: "crypto",
        quantity,
        avg_buy_price: buyPrice,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SymbolInput
          value={symbol}
          onChange={(v) => {
            setSymbol(v);
            if (!name) setName(v.toUpperCase());
          }}
          placeholder="bitcoin, ethereum, bnb, solana"
          hint="Use CoinGecko ID in lowercase"
          validating={validating}
          valid={valid}
          price={price}
          priceLabel="$"
          suggestions={suggestions}
          onSelectSuggestion={(s) => {
            setSymbol(s.id);
            setName(s.name);
            setSuggestions([]);
          }}
          onUsePrice={() => setBuyPrice(price)}
        />
        <div className="form-group">
          <label className="label">Coin name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bitcoin"
            required
          />
        </div>
        <div className="form-row form-row-2">
          <div className="form-group">
            <label className="label">Quantity (coins)</label>
            <input
              className="input"
              type="number"
              step="0.00000001"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.5"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              How many coins you own
            </p>
          </div>
          <div className="form-group">
            <label className="label">Avg buy price (USD)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="60000"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Price when you bought
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Notes (optional)</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Long term hold, DCA strategy..."
          />
        </div>
      </div>
      <FormFooter
        onCancel={onClose}
        disabled={valid === false || validating || saving}
        loading={saving}
      />
    </form>
  );
};

/* ─── Form: Stock Indonesia ─── */
const StockIDForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Auto-append .JK
  const symbol = ticker.toUpperCase().endsWith(".JK")
    ? ticker.toUpperCase()
    : ticker.toUpperCase() + (ticker.length >= 2 ? ".JK" : "");
  const { validating, valid, price } = useSymbolValidation(symbol, "stock_id");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valid === false) return;
    setSaving(true);
    try {
      await createAsset({
        symbol,
        asset_name: name || symbol,
        asset_type: "stock_id",
        quantity,
        avg_buy_price: buyPrice,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-group">
          <label className="label">
            Kode saham
            {validating && (
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--color-primary)",
                  fontSize: 12,
                }}
              >
                checking...
              </span>
            )}
            {valid === true && (
              <span style={{ marginLeft: 8, color: "#16a34a", fontSize: 12 }}>
                ✓ valid
              </span>
            )}
            {valid === false && (
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--color-ruby)",
                  fontSize: 12,
                }}
              >
                ✗ not found
              </span>
            )}
          </label>
          <input
            className="input"
            value={ticker}
            onChange={(e) =>
              setTicker(e.target.value.replace(".JK", "").replace(".jk", ""))
            }
            placeholder="BBCA, TLKM, BBRI, GOTO"
            required
            style={{
              borderColor:
                valid === true
                  ? "#16a34a"
                  : valid === false
                    ? "var(--color-ruby)"
                    : undefined,
            }}
          />
          {ticker.length >= 2 && (
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Symbol: <strong>{symbol}</strong> (suffix .JK otomatis)
            </p>
          )}
          {price && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 2,
              }}
            >
              <span className="caption" style={{ color: "#16a34a" }}>
                ✓ Harga sekarang: Rp {parseFloat(price).toLocaleString("id-ID")}
              </span>
              <button
                type="button"
                onClick={() => setBuyPrice(price)}
                className="caption"
                style={{
                  color: "var(--color-primary)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Pakai sebagai harga beli
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="label">Nama perusahaan</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bank Central Asia"
            required
          />
        </div>
        <div className="form-row form-row-2">
          <div className="form-group">
            <label className="label">Jumlah lembar</label>
            <input
              className="input"
              type="number"
              step="1"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="100"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              1 lot = 100 lembar
            </p>
          </div>
          <div className="form-group">
            <label className="label">Harga beli rata-rata (Rp)</label>
            <input
              className="input"
              type="number"
              step="1"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="8750"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Per lembar saat beli
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Catatan (opsional)</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Beli saat dip, long term..."
          />
        </div>
      </div>
      <FormFooter
        onCancel={onClose}
        disabled={valid === false || validating || saving}
        loading={saving}
      />
    </form>
  );
};

/* ─── Form: Stock US ─── */
const StockUSForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { validating, valid, price } = useSymbolValidation(
    symbol.toUpperCase(),
    "stock_us",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (valid === false) return;
    setSaving(true);
    try {
      await createAsset({
        symbol: symbol.toUpperCase(),
        asset_name: name || symbol.toUpperCase(),
        asset_type: "stock_us",
        quantity,
        avg_buy_price: buyPrice,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-group">
          <label className="label">
            Ticker symbol
            {validating && (
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--color-primary)",
                  fontSize: 12,
                }}
              >
                checking...
              </span>
            )}
            {valid === true && (
              <span style={{ marginLeft: 8, color: "#16a34a", fontSize: 12 }}>
                ✓ valid
              </span>
            )}
            {valid === false && (
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--color-ruby)",
                  fontSize: 12,
                }}
              >
                ✗ not found
              </span>
            )}
          </label>
          <input
            className="input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL, GOOGL, TSLA, MSFT, NVDA"
            required
            style={{
              borderColor:
                valid === true
                  ? "#16a34a"
                  : valid === false
                    ? "var(--color-ruby)"
                    : undefined,
            }}
          />
          <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
            NYSE / NASDAQ ticker
          </p>
          {price && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 2,
              }}
            >
              <span className="caption" style={{ color: "#16a34a" }}>
                ✓ Current price: $
                {parseFloat(price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <button
                type="button"
                onClick={() => setBuyPrice(price)}
                className="caption"
                style={{
                  color: "var(--color-primary)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Use as buy price
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="label">Company name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Apple Inc."
            required
          />
        </div>
        <div className="form-row form-row-2">
          <div className="form-group">
            <label className="label">Shares owned</label>
            <input
              className="input"
              type="number"
              step="0.001"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Fractional shares supported
            </p>
          </div>
          <div className="form-group">
            <label className="label">Avg buy price (USD)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="150.00"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Per share when you bought
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Notes (optional)</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Long term hold, dividend play..."
          />
        </div>
      </div>
      <FormFooter
        onCancel={onClose}
        disabled={valid === false || validating || saving}
        loading={saving}
      />
    </form>
  );
};

/* ─── Form: Gold ─── */
const GoldForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("Emas Antam");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { validating, valid, price } = useSymbolValidation("GC=F", "gold");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAsset({
        symbol: "GC=F",
        asset_name: name,
        asset_type: "gold",
        quantity,
        avg_buy_price: buyPrice,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Live price info */}
        <div
          style={{
            background: "var(--color-canvas-soft)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "var(--rounded-md)",
            padding: "12px 16px",
          }}
        >
          <p
            className="caption"
            style={{ color: "var(--color-ink-mute)", marginBottom: 4 }}
          >
            Harga emas sekarang (real-time)
          </p>
          {validating && (
            <p className="body-md" style={{ color: "var(--color-ink-mute)" }}>
              Mengambil harga...
            </p>
          )}
          {valid === true && price && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p className="heading-sm" style={{ color: "var(--color-ink)" }}>
                Rp {parseFloat(price).toLocaleString("id-ID")}{" "}
                <span
                  className="caption"
                  style={{ color: "var(--color-ink-mute)" }}
                >
                  / gram
                </span>
              </p>
              <button
                type="button"
                onClick={() => setBuyPrice(price)}
                className="btn btn-secondary btn-sm"
              >
                Pakai harga ini
              </button>
            </div>
          )}
          {valid === false && (
            <p className="caption" style={{ color: "var(--color-ruby)" }}>
              Gagal ambil harga, coba lagi nanti
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="label">Nama aset</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Emas Antam, Emas Pegadaian..."
            required
          />
        </div>
        <div className="form-row form-row-2">
          <div className="form-group">
            <label className="label">Jumlah (gram)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Berapa gram yang kamu punya
            </p>
          </div>
          <div className="form-group">
            <label className="label">Harga beli rata-rata (Rp/gram)</label>
            <input
              className="input"
              type="number"
              step="1"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="1200000"
              required
            />
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Harga per gram saat beli
            </p>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Catatan (opsional)</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Beli di Antam, simpan di brankas..."
          />
        </div>
      </div>
      <FormFooter onCancel={onClose} disabled={saving} loading={saving} />
    </form>
  );
};

/* ─── Form: Cash ─── */
const CashForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [currency, setCurrency] = useState("IDR");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const currInfo = SUPPORTED_CURRENCIES.find((c) => c.code === currency)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAsset({
        symbol: currency,
        asset_name: label || `Cash ${currency}`,
        asset_type: "cash",
        quantity: amount,
        avg_buy_price: "1",
        notes: undefined,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-group">
          <label className="label">Currency</label>
          <select
            className="input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Jumlah ({currency})</label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-ink-mute)",
                fontSize: 14,
                pointerEvents: "none",
              }}
            >
              {currInfo.symbol}
            </span>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currency === "IDR" ? "5000000" : "1000"}
              required
              style={{ paddingLeft: currency === "IDR" ? 32 : 28 }}
            />
          </div>
          <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
            {currency === "IDR"
              ? "Total Rupiah yang kamu punya"
              : `Total ${currency} yang kamu punya`}
          </p>
        </div>
        <div className="form-group">
          <label className="label">Label (opsional)</label>
          <input
            className="input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={
              currency === "IDR"
                ? "Tabungan BCA, Dompet..."
                : "Dollar savings, Emergency fund..."
            }
          />
          <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
            Nama untuk membedakan jika punya beberapa cash
          </p>
        </div>
        <div
          style={{
            background: "var(--color-canvas-soft)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "var(--rounded-md)",
            padding: "10px 14px",
          }}
        >
          <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
            💡 Cash tidak perlu harga beli — nilainya selalu {currInfo.symbol}1
            = 1 {currency}.
            {currency !== "IDR" &&
              " Untuk net worth, akan dikonversi ke IDR pakai kurs real-time."}
          </p>
        </div>
      </div>
      <FormFooter onCancel={onClose} disabled={saving} loading={saving} />
    </form>
  );
};
