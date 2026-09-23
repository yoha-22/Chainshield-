import React, { useState } from "react";
import "../styles/chainshield-theme.css";

/**
 * AdminPanel — three tabs: Rules (mirrors thresholdEngine.js), Users,
 * System health. The rule sliders are UI only — wire onChange to a
 * PATCH /api/admin/rules endpoint that updates thresholdEngine.js's
 * config, or a rules collection in Mongo if you externalize it.
 */
export default function AdminPanel() {
  const [tab, setTab] = useState("rules");

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page">
        <span className="cs-eyebrow">Restricted</span>
        <h1 className="cs-h1" style={{ fontSize: 32 }}>Admin panel</h1>
        <p className="cs-sub">Tune fraud rules, manage analyst accounts, and watch system health.</p>

        <div
          className="cs-row"
          style={{ marginTop: 22, background: "var(--cs-surface)", border: "1px solid var(--cs-border)", borderRadius: 10, padding: 4, width: "fit-content" }}
        >
          {[
            { key: "rules", label: "Rules" },
            { key: "users", label: "Users" },
            { key: "health", label: "System health" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="cs-btn"
              style={{ border: "none", background: tab === t.key ? "var(--cs-teal-dim)" : "transparent", color: tab === t.key ? "var(--cs-teal)" : "var(--cs-text-secondary)" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          {tab === "rules" && <RulesTab />}
          {tab === "users" && <UsersTab />}
          {tab === "health" && <HealthTab />}
        </div>
      </div>
    </div>
  );
}

function RulesTab() {
  const [rules, setRules] = useState([
    { key: "HIGH_AMOUNT", label: "High amount", desc: "Flags transactions at or above this value.", value: 50000, min: 5000, max: 200000, step: 5000, unit: "₹", enabled: true },
    { key: "HIGH_FRAUD_SCORE", label: "High fraud score", desc: "Flags when the ML model's score crosses this line.", value: 0.75, min: 0.3, max: 0.99, step: 0.01, unit: "", enabled: true },
    { key: "ROUND_NUMBER_AMOUNT", label: "Round-number amount", desc: "Flags amounts that are suspicious multiples.", value: 10000, min: 1000, max: 50000, step: 1000, unit: "₹", enabled: true },
    { key: "VELOCITY_ANOMALY", label: "Velocity anomaly", desc: "Flags 5+ transactions from one sender within 10 minutes.", value: 5, min: 2, max: 20, step: 1, unit: " txns", enabled: true },
    { key: "ODD_HOUR_ACTIVITY", label: "Odd-hour activity", desc: "Flags transactions between 1 AM and 5 AM.", value: 1, min: 0, max: 1, step: 1, unit: "", enabled: false },
  ]);

  const update = (key, value) => setRules((rs) => rs.map((r) => (r.key === key ? { ...r, value } : r)));
  const toggle = (key) => setRules((rs) => rs.map((r) => (r.key === key ? { ...r, enabled: !r.enabled } : r)));

  return (
    <div className="cs-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rules.map((r) => (
        <div key={r.key} className="cs-card" style={{ padding: 20, opacity: r.enabled ? 1 : 0.55 }}>
          <div className="cs-flex-between">
            <div>
              <div className="cs-row">
                <span className="cs-mono" style={{ fontSize: 11, color: "var(--cs-text-muted)" }}>{r.key}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{r.label}</div>
              <p className="cs-muted" style={{ fontSize: 12, marginTop: 2 }}>{r.desc}</p>
            </div>
            <label className="cs-switch">
              <input type="checkbox" checked={r.enabled} onChange={() => toggle(r.key)} />
              <span className="cs-switch-track" />
            </label>
          </div>

          {r.key !== "ODD_HOUR_ACTIVITY" && (
            <div style={{ marginTop: 16 }}>
              <div className="cs-flex-between" style={{ marginBottom: 6 }}>
                <span className="cs-muted" style={{ fontSize: 11 }}>Threshold</span>
                <span className="cs-mono" style={{ fontSize: 13, color: "var(--cs-teal)" }}>
                  {r.unit === "₹" ? "₹" : ""}
                  {r.value.toLocaleString("en-IN")}
                  {r.unit !== "₹" ? r.unit : ""}
                </span>
              </div>
              <input
                type="range"
                min={r.min}
                max={r.max}
                step={r.step}
                value={r.value}
                disabled={!r.enabled}
                onChange={(e) => update(r.key, Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--cs-teal)" }}
              />
            </div>
          )}
        </div>
      ))}
      <button className="cs-btn cs-btn--primary" style={{ alignSelf: "flex-start", marginTop: 4 }}>Save rule changes</button>
    </div>
  );
}

function UsersTab() {
  const users = [
    { name: "Aditi Sharma", email: "aditi@example.com", role: "Admin", status: "active" },
    { name: "Rohan Iyer", email: "rohan@example.com", role: "Analyst", status: "active" },
    { name: "Priya Menon", email: "priya@example.com", role: "Analyst", status: "invited" },
  ];
  return (
    <div className="cs-card" style={{ padding: 0, overflow: "hidden" }}>
      {users.map((u, i) => (
        <div
          key={u.email}
          className="cs-flex-between"
          style={{ padding: "16px 20px", borderTop: i === 0 ? "none" : "1px solid var(--cs-border)" }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
            <div className="cs-muted" style={{ fontSize: 12 }}>{u.email}</div>
          </div>
          <div className="cs-row">
            <span className="cs-badge cs-badge--info">{u.role}</span>
            <span className={`cs-badge ${u.status === "active" ? "cs-badge--approved" : "cs-badge--pending"}`}>{u.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HealthTab() {
  const services = [
    { name: "Node API (port 4000)", state: "ok" },
    { name: "Flask ML service (port 5000)", state: "ok" },
    { name: "MongoDB", state: "ok" },
    { name: "Local blockchain (Ganache)", state: "down" },
  ];
  return (
    <div className="cs-grid-2 cs-stagger">
      {services.map((s) => (
        <div key={s.name} className="cs-card cs-row" style={{ padding: 18 }}>
          <span className={`cs-pulse-dot cs-pulse-dot--${s.state === "ok" ? "ok" : "down"}`} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
            <div className="cs-muted" style={{ fontSize: 12 }}>{s.state === "ok" ? "Responding normally" : "Not reachable"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}