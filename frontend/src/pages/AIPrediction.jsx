import React, { useState } from "react";
import "../styles/chainshield-theme.css";

/**
 * AIPrediction — submit a single transaction's features and show the
 * model's verdict. Replace `runPrediction`'s mock with a real call:
 *   const { data } = await axios.post(`${API_URL}/predict`, features)
 * `data` is expected to look like { fraud_score, is_fraud, top_reasons }.
 */
export default function AIPrediction() {
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | scanning | done
  const [result, setResult] = useState(null);

  const runPrediction = (e) => {
    e.preventDefault();
    if (!amount) return;
    setPhase("scanning");
    setResult(null);

    // --- mock scoring, swap for the real /predict call ---
    setTimeout(() => {
      const score = Math.min(0.97, Math.random() * (Number(amount) > 40000 ? 0.9 : 0.5) + 0.05);
      const isFraud = score >= 0.75;
      setResult({
        score,
        isFraud,
        reasons: isFraud
          ? ["Amount well above sender's 30-day average", "Round-number amount (₹ multiple of 10,000)", "Sent during low-activity hours"]
          : ["Amount consistent with sender history", "Wallet age over 90 days", "No velocity anomalies detected"],
      });
      setPhase("done");
    }, 1600);
  };

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page">
        <span className="cs-eyebrow" style={{ color: "var(--cs-violet)" }}>AI Prediction</span>
        <h1 className="cs-h1">Score a transaction</h1>
        <p className="cs-sub">XGBoost weighs the features, SHAP explains the weighting, and you get a verdict in plain language.</p>

        <div className="cs-grid-2" style={{ marginTop: 28, alignItems: "start" }}>
          <form onSubmit={runPrediction} className="cs-card cs-card--violet">
            <div className="cs-field">
              <label className="cs-label">Amount (₹)</label>
              <input className="cs-input" type="number" placeholder="e.g. 60000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="cs-field">
              <label className="cs-label">Category</label>
              <select className="cs-select" defaultValue="grocery_pos">
                <option value="grocery_pos">grocery_pos</option>
                <option value="online_transfer">online_transfer</option>
                <option value="wallet_topup">wallet_topup</option>
                <option value="crypto_swap">crypto_swap</option>
              </select>
            </div>
            <button className="cs-btn cs-btn--violet" style={{ width: "100%", justifyContent: "center" }} disabled={phase === "scanning"}>
              {phase === "scanning" ? "Analyzing…" : "Run prediction"}
            </button>
          </form>

          <div className="cs-card" style={{ minHeight: 260 }}>
            {phase === "idle" && (
              <div style={{ display: "grid", placeItems: "center", height: "100%", minHeight: 220 }}>
                <p className="cs-muted" style={{ textAlign: "center" }}>Run a prediction to see the score, verdict and reasoning here.</p>
              </div>
            )}

            {phase === "scanning" && (
              <div style={{ padding: "24px 4px" }}>
                <div className="cs-muted cs-mono" style={{ fontSize: 12, marginBottom: 10 }}>SCANNING TRANSACTION…</div>
                <div className="cs-scanner" />
                <ul style={{ marginTop: 22, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Loading feature vector", "Scoring with XGBoost", "Computing SHAP attributions"].map((s, i) => (
                    <li key={s} className="cs-muted" style={{ fontSize: 13, animation: `cs-fade 0.4s ease ${i * 0.3}s both` }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {phase === "done" && result && (
              <div className="cs-stagger">
                <div className="cs-flex-between">
                  <div
                    className="cs-gauge"
                    style={{ "--pct": Math.round(result.score * 100), "--gauge-color": result.isFraud ? "var(--cs-red)" : "var(--cs-teal)" }}
                  >
                    <span className="cs-gauge-value">{Math.round(result.score * 100)}%</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`cs-badge ${result.isFraud ? "cs-badge--flagged" : "cs-badge--approved"}`}>
                      {result.isFraud ? "Flagged" : "Approved"}
                    </span>
                    <div className="cs-muted" style={{ marginTop: 8, fontSize: 12 }}>fraud score</div>
                  </div>
                </div>

                <div className="cs-divider-label">Why</div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.reasons.map((r) => (
                    <li key={r} className="cs-row" style={{ fontSize: 13, color: "var(--cs-text-secondary)" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: result.isFraud ? "var(--cs-red)" : "var(--cs-teal)", flexShrink: 0 }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}