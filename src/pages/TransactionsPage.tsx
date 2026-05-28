/**
 * Transactions Page
 *
 * Form: catat transaksi BUY/SELL untuk asset yang sudah ada.
 * List: tampilkan history transaksi dengan currency yang benar per asset.
 */

import React, { useEffect, useState } from "react";
import { AppShell, AssetLogo } from "../components";
import { createTransaction, getAssets, getTransactions } from "../api";
import type { TransactionCreate } from "../api";
import { formatDate, formatMoney, formatQuantity } from "../lib/format";

const BLANK: TransactionCreate = {
  asset_id: "",
  transaction_type: "buy",
  quantity: "",
  price_per_unit: "",
  fees: "",
  notes: "",
  transaction_date: new Date().toISOString().slice(0, 16),
};

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TransactionCreate>(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [tx, a] = await Promise.all([getTransactions(), getAssets()]);
      setTransactions(tx);
      setAssets(a);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await createTransaction(formData);
      setShowForm(false);
      setFormData(BLANK);
      await loadAll();
    } catch (e: any) {
      setFormError(e.response?.data?.message || "Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  // Group totals by currency to avoid mixing IDR and USD
  const buyTotalsByCurrency: Record<string, number> = {};
  const sellTotalsByCurrency: Record<string, number> = {};
  transactions.forEach((t) => {
    const total = parseFloat(t.quantity) * parseFloat(t.price_per_unit);
    const curr = t.currency || "IDR";
    if (t.transaction_type === "buy") {
      buyTotalsByCurrency[curr] = (buyTotalsByCurrency[curr] || 0) + total;
    } else if (t.transaction_type === "sell") {
      sellTotalsByCurrency[curr] = (sellTotalsByCurrency[curr] || 0) + total;
    }
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="heading-md">Transactions</h1>
          <p
            className="caption"
            style={{ color: "var(--color-ink-mute)", marginTop: 2 }}
          >
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          id="toggle-add-tx"
          className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          disabled={assets.length === 0}
          onClick={() => {
            setShowForm(!showForm);
            setFormError("");
            setFormData(BLANK);
          }}
          title={assets.length === 0 ? "Add assets first" : ""}
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add transaction
            </>
          )}
        </button>
      </div>

      <div className="page-body" style={{ margin: "0 auto" }}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* No assets warning */}
        {!loading && assets.length === 0 && (
          <div className="alert alert-warn" style={{ marginBottom: 24 }}>
            You need to add assets before recording transactions.{" "}
            <a
              href="/assets"
              style={{
                color: "inherit",
                fontWeight: 400,
                textDecoration: "underline",
              }}
            >
              Go to Assets →
            </a>
          </div>
        )}

        {/* ── Summary Stat ── */}
        {!loading && transactions.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div className="stat-card">
              <p className="stat-label">Total transactions</p>
              <p className="stat-value tabular" style={{ fontSize: 24 }}>
                {transactions.length}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total bought</p>
              {Object.keys(buyTotalsByCurrency).length === 0 ? (
                <p
                  className="stat-value tabular"
                  style={{ fontSize: 22, color: "var(--color-ink-mute)" }}
                >
                  —
                </p>
              ) : (
                Object.entries(buyTotalsByCurrency).map(([curr, total]) => (
                  <p
                    key={curr}
                    className="tabular"
                    style={{
                      fontSize: 18,
                      fontWeight: 400,
                      color: "var(--color-ink-green)",
                    }}
                  >
                    {formatMoney(total, curr)}
                  </p>
                ))
              )}
            </div>
            <div className="stat-card">
              <p className="stat-label">Total sold</p>
              {Object.keys(sellTotalsByCurrency).length === 0 ? (
                <p
                  className="stat-value tabular"
                  style={{ fontSize: 22, color: "var(--color-ink-mute)" }}
                >
                  —
                </p>
              ) : (
                Object.entries(sellTotalsByCurrency).map(([curr, total]) => (
                  <p
                    key={curr}
                    className="tabular"
                    style={{
                      fontSize: 18,
                      fontWeight: 400,
                      color: "var(--color-ink-red)",
                    }}
                  >
                    {formatMoney(total, curr)}
                  </p>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Add Form ── */}
        {showForm && assets.length > 0 && (
          <div className="card fade-in" style={{ marginBottom: 24 }}>
            <p className="heading-sm" style={{ marginBottom: 20 }}>
              Record transaction
            </p>
            <form id="add-tx-form" onSubmit={handleCreate}>
              <div className="form-row form-row-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="label" htmlFor="tx-asset">
                    Asset
                  </label>
                  <select
                    id="tx-asset"
                    className="input"
                    value={formData.asset_id}
                    onChange={(e) =>
                      setFormData({ ...formData, asset_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select asset…</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_name} ({a.symbol}) — {a.currency || "IDR"}
                      </option>
                    ))}
                  </select>
                  {formData.asset_id &&
                    (() => {
                      const asset = assets.find(
                        (a) => a.id === formData.asset_id,
                      );
                      if (!asset) return null;
                      const curr = asset.currency || "IDR";
                      return (
                        <p
                          className="caption"
                          style={{
                            color: "var(--color-ink-mute)",
                            marginTop: 4,
                          }}
                        >
                          {curr === "USD"
                            ? `💵 Harga input dalam USD. 1 ${asset.symbol} ≈ harga di ${asset.asset_type === "crypto" ? "CoinGecko" : "Yahoo Finance"}`
                            : `💴 Harga input dalam Rupiah${asset.asset_type === "gold" ? " per gram" : ""}`}
                        </p>
                      );
                    })()}
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="tx-type">
                    Type
                  </label>
                  <select
                    id="tx-type"
                    className="input"
                    value={formData.transaction_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_type: e.target.value as "buy" | "sell",
                      })
                    }
                    required
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="tx-qty">
                    Quantity
                  </label>
                  <input
                    id="tx-qty"
                    className="input tabular"
                    type="number"
                    step="0.00000001"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="0.5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="tx-price">
                    Price per unit
                    {formData.asset_id &&
                      (() => {
                        const asset = assets.find(
                          (a) => a.id === formData.asset_id,
                        );
                        const curr = asset?.currency || "IDR";
                        return (
                          <span
                            style={{
                              color:
                                curr === "USD"
                                  ? "#16a34a"
                                  : "var(--color-primary)",
                              marginLeft: 6,
                              fontWeight: 400,
                            }}
                          >
                            ({curr})
                          </span>
                        );
                      })()}
                  </label>
                  <input
                    id="tx-price"
                    className="input tabular"
                    type="number"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_per_unit: e.target.value,
                      })
                    }
                    placeholder={(() => {
                      const asset = assets.find(
                        (a) => a.id === formData.asset_id,
                      );
                      const curr = asset?.currency || "IDR";
                      if (curr === "USD")
                        return asset?.asset_type === "crypto" ? "60000" : "150";
                      return "8750";
                    })()}
                    required
                  />
                  {formData.quantity &&
                    formData.price_per_unit &&
                    (() => {
                      const asset = assets.find(
                        (a) => a.id === formData.asset_id,
                      );
                      const curr = asset?.currency || "IDR";
                      const total =
                        parseFloat(formData.quantity) *
                        parseFloat(formData.price_per_unit);
                      if (isNaN(total)) return null;
                      return (
                        <p
                          className="caption"
                          style={{
                            color: "var(--color-ink-mute)",
                            marginTop: 4,
                          }}
                        >
                          Total:{" "}
                          <strong style={{ color: "var(--color-ink)" }}>
                            {formatMoney(total, curr)}
                          </strong>
                        </p>
                      );
                    })()}
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="tx-date">
                    Date
                  </label>
                  <input
                    id="tx-date"
                    className="input"
                    type="datetime-local"
                    value={formData.transaction_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="tx-fees">
                    Fees (optional)
                    {formData.asset_id &&
                      (() => {
                        const asset = assets.find(
                          (a) => a.id === formData.asset_id,
                        );
                        const curr = asset?.currency || "IDR";
                        return (
                          <span
                            style={{
                              color: "var(--color-ink-mute)",
                              marginLeft: 6,
                            }}
                          >
                            ({curr})
                          </span>
                        );
                      })()}
                  </label>
                  <input
                    id="tx-fees"
                    className="input tabular"
                    type="number"
                    step="0.01"
                    value={formData.fees}
                    onChange={(e) =>
                      setFormData({ ...formData, fees: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="label" htmlFor="tx-notes">
                    Notes (optional)
                  </label>
                  <input
                    id="tx-notes"
                    className="input"
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="DCA round 1, beli saat dip..."
                  />
                </div>
              </div>
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  {formError}
                </div>
              )}
              <button
                id="save-tx"
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? "Saving…" : "Record transaction"}
              </button>
            </form>
          </div>
        )}

        {/* ── Transactions Table ── */}
        {loading ? (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: 48 }} />
              ))}
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state card">
            <svg
              className="empty-state-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <p
              className="body-md"
              style={{ color: "var(--color-ink)", marginBottom: 6 }}
            >
              No transactions yet
            </p>
            <p className="caption" style={{ color: "var(--color-ink-mute)" }}>
              Record your buy/sell activity to track performance
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Quantity</th>
                  <th style={{ textAlign: "right" }}>Price / unit</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th style={{ textAlign: "right" }}>Fees</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const total =
                    parseFloat(tx.quantity) * parseFloat(tx.price_per_unit);
                  const currency = tx.currency || "IDR";
                  const isGold = tx.asset_type === "gold";
                  return (
                    <tr key={tx.id}>
                      <td
                        className="caption tabular"
                        style={{
                          color: "var(--color-ink-mute)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <AssetLogo
                            symbol={tx.asset_symbol}
                            assetType={tx.asset_type}
                            size={28}
                            borderRadius="var(--rounded-sm)"
                          />
                          <div>
                            <p
                              style={{
                                fontWeight: 400,
                                fontSize: 14,
                                margin: 0,
                              }}
                            >
                              {tx.asset_name ?? "—"}
                            </p>
                            <p
                              className="micro"
                              style={{
                                color: "var(--color-ink-mute)",
                                margin: "2px 0 0 0",
                              }}
                            >
                              {tx.asset_symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`pill-tag ${tx.transaction_type === "buy" ? "pill-tag-green" : "pill-tag-red"}`}
                        >
                          {tx.transaction_type?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="tabular" style={{ textAlign: "right" }}>
                        {formatQuantity(tx.quantity, tx.asset_type)}
                      </td>
                      <td className="tabular" style={{ textAlign: "right" }}>
                        {formatMoney(tx.price_per_unit, currency)}
                        {isGold ? "/g" : ""}
                      </td>
                      <td
                        className="tabular"
                        style={{ textAlign: "right", fontWeight: 400 }}
                      >
                        {formatMoney(total, currency)}
                      </td>
                      <td
                        className="tabular"
                        style={{
                          textAlign: "right",
                          color: "var(--color-ink-mute)",
                        }}
                      >
                        {parseFloat(tx.fees || 0) > 0
                          ? formatMoney(tx.fees, currency)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
};
