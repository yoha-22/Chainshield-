import React from "react";
import { Link } from "react-router-dom";
import "../styles/chainshield-theme.css";

/**
 * Home — landing page.
 * Hero states the product's single job in one line, then hands off
 * immediately to Login and Dashboard. Stats are illustrative — wire
 * `stats` to GET /api/transactions on mount if you want live numbers.
 */
export default function Home() {
  const stats = [
    { label: "Transactions scanned", value: "12,480" },
    { label: "Fraud caught", value: "312" },
    { label: "Avg. decision time", value: "180ms" },
  ];

  const steps = [
    { n: "01", title: "Transaction submitted", body: "A transfer hits the API with amount, wallet and behavioural features." },
    { n: "02", title: "AI scores it", body: "XGBoost + threshold rules score the transaction and explain why in plain language." },
    { n: "03", title: "Chain locks it in", body: "The verdict and hash are written on-chain — nobody edits the record after the fact." },
  ];

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page">
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 620 }}>
            <span className="cs-eyebrow">AI Fraud Detection · Blockchain Secured</span>
            <h1 className="cs-h1">
              Catch fraud in the time
              <br />
              it takes to blink.
            </h1>
            <p className="cs-sub">
              ChainShield scores every transaction with a trained model, explains the verdict, and
              settles the record on-chain — so nothing gets quietly edited later.
            </p>
            <div className="cs-row" style={{ marginTop: 26 }}>
              <Link to="/login" className="cs-btn cs-btn--primary">Get started →</Link>
              <Link to="/dashboard" className="cs-btn cs-btn--ghost">View live dashboard</Link>
            </div>
          </div>
          <HeroMark />
        </div>

        {/* Stats strip */}
        <div className="cs-grid-3 cs-stagger" style={{ marginTop: 56 }}>
          {stats.map((s) => (
            <div className="cs-card" key={s.label}>
              <div className="cs-h2" style={{ fontSize: 30 }}>{s.value}</div>
              <div className="cs-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works — genuinely sequential, so numbering earns its place */}
        <div className="cs-divider-label">How a transaction moves through ChainShield</div>
        <div className="cs-grid-3 cs-stagger">
          {steps.map((step) => (
            <div className="cs-card" key={step.n}>
              <div className="cs-mono" style={{ color: "var(--cs-teal)", fontSize: 12, marginBottom: 10 }}>{step.n}</div>
              <div className="cs-h2" style={{ fontSize: 16 }}>{step.title}</div>
              <p className="cs-muted" style={{ marginTop: 6 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Signature hero mark: a shield built from a sweeping arc + pulsing node,
   echoing the "scan" motif used across cards. Pure SVG, no image assets. */
function HeroMark() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="csShieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4a7" />
          <stop offset="100%" stopColor="#8b7bff" />
        </linearGradient>
      </defs>
      <path
        d="M90 14 L152 38 V88 C152 128 126 154 90 168 C54 154 28 128 28 88 V38 Z"
        stroke="url(#csShieldGrad)"
        strokeWidth="2.5"
        fill="rgba(45,212,167,0.05)"
      >
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3.2s" repeatCount="indefinite" />
      </path>
      <circle cx="90" cy="90" r="6" fill="#2dd4a7">
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="90" r="30" stroke="#8b7bff" strokeOpacity="0.4" strokeWidth="1.2" fill="none">
        <animate attributeName="r" values="20;44;20" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="3.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}