import React, { useMemo, useState } from "react";
import "../styles/chainshield-theme.css";

/**
 * TransactionHistory — filterable, searchable ledger view.
 * Replace MOCK_TX with data from GET /api/transactions.
 */
export default function TransactionHistory() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return MOCK_TX.filter((t) => (tab === "all" ? true : t.status === tab))
      .filter((t) => t.id.toLowerCase().includes(query.toLowerCase()) || t.note.toLowerCase().includes(query.toLowerCase()));
  }, [tab, query]);

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page">
        <span className="cs-eyebrow">Ledger</span>
        <h1 className="cs-h1">Transaction history</h1>
        <p className="cs-sub">Every scored transaction, searchable by ID or note.</p>

        <div className="cs-flex-between" style={{ marginTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div className="cs-row" style={{ background: "var(--cs-surface)", border: "1px solid var(--cs-border)", borderRadius: 10, padding: 4 }}>
            {[
              { key: "all", label: "All" },
              { key: "flagged", label: "Flagged" },
              { key: "approved", label: "Approved" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                type="button"
                className="cs-btn"
                style={{
                  border: "none",
                  background: tab === t.key ? "var(--cs-teal-dim)" : "transparent",
                  color: tab === t.key ? "var(--cs-teal)" : "var(--cs-text-secondary)",
                  padding: "8px 16px",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            className="cs-input"
            placeholder="Search by ID or note…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>

        <div className="cs-stagger" style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div className="cs-card" style={{ textAlign: "center" }}>
              <p className="cs-muted">No transactions match that search.</p>
            </div>
          )}
          {filtered.map((t) => (
            <div key={t.id} className="cs-card" style={{ padding: 16 }}>
              <div className="cs-flex-between" style={{ flexWrap: "wrap", gap: 10 }}>
                <div className="cs-row">
                  <div>
                    <div className="cs-row">
                      <span className="cs-mono" style={{ fontSize: 12, color: "var(--cs-text-muted)" }}>{t.id}</span>
                      <span className={`cs-badge ${t.status === "flagged" ? "cs-badge--flagged" : "cs-badge--approved"}`}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>₹{t.amount.toLocaleString("en-IN")}</div>
                    <div className="cs-muted" style={{ fontSize: 12 }}>{t.note}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="cs-muted" style={{ fontSize: 11 }}>fraud score</div>
                  <div style={{ fontFamily: "var(--cs-font-mono)", fontSize: 14, color: t.status === "flagged" ? "var(--cs-red)" : "var(--cs-teal)" }}>
                    {(t.score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCK_TX = [
  { id: "TXN1001", amount: 500, status: "approved", note: "grocery_pos", score: 0.03 },
  { id: "TXN1002", amount: 60000, status: "flagged", note: "round-number, high amount", score: 0.81 },
  { id: "TXN1003", amount: 60000, status: "approved", note: "verified wallet, 6mo history", score: 0.22 },
  { id: "TXN1004", amount: 1200, status: "approved", note: "online_transfer", score: 0.05 },
  { id: "TXN1005", amount: 92000, status: "flagged", note: "odd-hour activity, 2:14 AM", score: 0.88 },
  { id: "TXN1006", amount: 3400, status: "approved", note: "wallet_topup", score: 0.11 },
];