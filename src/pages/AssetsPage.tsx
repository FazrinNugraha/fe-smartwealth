/**
 * Assets Page
 *
 * Menampilkan daftar aset milik user dengan informasi:
 *  - Quantity (qty + unit gram untuk gold)
 *  - Avg buy price (dalam currency aslinya)
 *  - Total invested
 *
 * Action: tambah aset baru via AddAssetModal, hapus aset.
 */

import React, { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { AddAssetModal } from "../components/AddAssetModal";
import { AssetLogo } from "../components";
import { deleteAsset, getAssets } from "../api";
import { ASSET_LABELS } from "../lib/constants";
import { formatDate, formatMoney, formatQuantity } from "../lib/format";

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error("Failed to load assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteAsset(id);
      loadAssets();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete");
    }
  };

  return (
    <AppShell>
      {showModal && (
        <AddAssetModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadAssets();
          }}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="heading-lg">Assets</h1>
          <p
            className="body-md"
            style={{ color: "var(--color-ink-mute)", marginTop: 4 }}
          >
            {assets.length > 0
              ? `${assets.length} asset${assets.length > 1 ? "s" : ""}`
              : "No assets yet"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={loadAssets}>
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add asset
          </button>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: "none" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 80 }} />
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
            <p className="body-md" style={{ marginBottom: 6 }}>
              No assets yet
            </p>
            <p
              className="caption"
              style={{ color: "var(--color-ink-mute)", marginBottom: 20 }}
            >
              Add your crypto, stocks, gold, or cash
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Add first asset
            </button>
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              borderRadius: "var(--rounded-lg)",
              border: "1px solid var(--color-hairline)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <div className="table-scroll">
              <table className="sw-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 20 }}>Date Acquired</th>
                    <th>Asset</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Quantity</th>
                    <th style={{ textAlign: "right" }}>Avg Buy Price</th>
                    <th style={{ textAlign: "right" }}>Total Invested</th>
                    <th style={{ textAlign: "right", paddingRight: 20 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const qty = parseFloat(asset.quantity);
                    const buyPrice = parseFloat(asset.avg_buy_price);
                    const totalInvested = qty * buyPrice;
                    const currency = asset.currency || "IDR";
                    const isGold = asset.asset_type === "gold";

                    // Get matching badge CSS class
                    const badgeClass = (() => {
                      switch (asset.asset_type) {
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
                    })();

                    return (
                      <tr
                        key={asset.id}
                        style={{ transition: "background-color 0.15s ease" }}
                      >
                        {/* Date Acquired */}
                        <td
                          className="caption tabular"
                          style={{
                            color: "var(--color-ink-mute)",
                            whiteSpace: "nowrap",
                            paddingLeft: 20,
                            fontWeight: 400,
                          }}
                        >
                          {formatDate(asset.created_at)}
                        </td>

                        {/* Asset Info: Logo, Name, Ticker */}
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
                              size={36}
                              borderRadius="var(--rounded-md)"
                            />
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontWeight: 500,
                                  color: "var(--color-ink)",
                                  fontSize: "14px",
                                  margin: 0,
                                  lineHeight: 1.2,
                                }}
                              >
                                {asset.asset_name}
                              </p>
                              <p
                                className="micro"
                                style={{
                                  color: "var(--color-ink-mute)",
                                  margin: "2px 0 0 0",
                                }}
                              >
                                {asset.symbol}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category badge */}
                        <td>
                          <span
                            className={badgeClass}
                            style={{ fontSize: "10px", padding: "3px 8px" }}
                          >
                            {ASSET_LABELS[asset.asset_type] || asset.asset_type}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td
                          className="tabular"
                          style={{ textAlign: "right", fontWeight: 400 }}
                        >
                          {formatQuantity(qty, asset.asset_type, currency)}
                        </td>

                        {/* Avg Buy Price */}
                        <td
                          className="tabular"
                          style={{ textAlign: "right", fontWeight: 400 }}
                        >
                          {formatMoney(buyPrice, currency)}
                          {isGold ? "/g" : ""}
                        </td>

                        {/* Total Invested */}
                        <td
                          className="tabular"
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color: "var(--color-primary)",
                          }}
                        >
                          {formatMoney(totalInvested, currency)}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "right", paddingRight: 20 }}>
                          <button
                            onClick={() =>
                              handleDelete(asset.id, asset.asset_name)
                            }
                            className="btn btn-secondary btn-sm"
                            style={{
                              color: "var(--color-ruby)",
                              borderColor: "var(--color-ruby)",
                              backgroundColor: "transparent",
                              padding: "4px 12px",
                              borderRadius: "var(--rounded-sm)",
                              fontSize: "12px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
