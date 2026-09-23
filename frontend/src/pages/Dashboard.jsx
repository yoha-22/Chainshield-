import React, { useEffect, useState } from "react";
import "../styles/chainshield-theme.css";

/**
 * Dashboard — overview stats + recent activity feed.
 * Wire `useEffect` to GET /api/transactions and derive the stats,
 * instead of the static numbers below.
 */
export default function Dashboard() {
  const [counts, setCounts] = useState({ total: 0, flagged: 0, approved: 0 });
  const targets = { total: 6, flagged: 1, approved: 5 };

  useEffect(() => {
    // simple count-up on mount
    const start = performance.now();
    const duration = 900;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCounts({
        total: Math.round(targets.total * eased),
        flagged: Math.round(targets.flagged * eased),
        approved: Math.round(targets.approved * eased),
      });
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fraudRate = targets.total ? ((targets.flagged / targets.total) * 100).toFixed(1) : "0.0";

  const activity = [
    { id: "t1", amount: 500, status: "approved", note: "grocery_pos" },
    { id: "t2", amount: 60000, status: "flagged", note: "round-number, high amount" },
    { id: "t3", amount: 60000, status: "approved", note: "known wallet, verified" },
    { id: "t4", amount: 1200, status: "approved", note: "online_transfer" },
  ];

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page">
        <div className="cs-flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="cs-eyebrow">Live Overview</span>
            <h1 className="cs-h1" style={{ fontSize: 32 }}>Dashboard</h1>
          </div>
          <div className="cs-row">
            <span className="cs-pulse-dot cs-pulse-dot--ok" />
            <span className="cs-muted" style={{ fontSize: 13 }}>Systems online</span>
          </div>
        </div>

        <div className="cs-grid-3 cs-stagger" style={{ marginTop: 24, gridTemplateColumns: "repeat(4, 1fr)" }}>
          <StatCard label="Total transactions" value={counts.total} />
          <StatCard label="Flagged" value={counts.flagged} accent="var(--cs-red)" />
          <StatCard label="Approved" value={counts.approved} accent="var(--cs-teal)" />
          <StatCard label="Fraud rate" value={`${fraudRate}%`} accent="var(--cs-amber)" />
        </div>

        <div className="cs-divider-label">Recent activity</div>
        <div className="cs-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activity.map((a) => (
            <div key={a.id} className={`cs-card ${a.status === "flagged" ? "" : ""}`} style={{ padding: 18, borderLeft: `3px solid ${a.status === "flagged" ? "var(--cs-red)" : "var(--cs-teal)"}` }}>
              <div className="cs-flex-between">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>₹{a.amount.toLocaleString("en-IN")}</div>
                  <div className="cs-muted" style={{ fontSize: 12, marginTop: 2 }}>{a.note}</div>
                </div>
                <span className={`cs-badge ${a.status === "flagged" ? "cs-badge--flagged" : "cs-badge--approved"}`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="cs-card">
      <div className="cs-h2" style={{ fontSize: 28, color: accent || "var(--cs-text-primary)" }}>{value}</div>
      <div className="cs-muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{label}</div>
    </div>
  );
}