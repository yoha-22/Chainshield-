import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

const CATEGORIES = [
  "grocery_pos", "shopping_net", "shopping_pos", "gas_transport",
  "entertainment", "food_dining", "health_fitness", "misc_net",
  "personal_care", "travel",
];

function ShieldMark() {
  return (
    <div className="brand-mark">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l8 3.2v5.4c0 5-3.4 9-8 10.4-4.6-1.4-8-5.4-8-10.4V5.2L12 2z" fill="#06201C" />
        <path d="M9 12.3l2 2 4.2-4.6" stroke="#2DD4BF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function HashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M9 3L7 21M17 3l-2 18M4 9h17M3 15h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function truncateHash(hash) {
  if (!hash) return null;
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

// Renamed from App -> LiveConsole. This is the user's original, already-working
// transaction submission + live ledger page. Logic is untouched.
function LiveConsole() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendUp, setBackendUp] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`);
      setTransactions(res.data);
      setBackendUp(true);
    } catch (err) {
      setBackendUp(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const features = {
        category,
        amt: Number(amount),
        gender: "M",
        city_pop: 50000,
        job: "Engineer",
        unix_time: Math.floor(Date.now() / 1000),
        merch_lat: 36.0,
        merch_long: -82.0,
        lat: 36.1,
        long: -82.1,
      };

      await axios.post(`${API_URL}/transaction`, {
        transactionId: "TXN" + Date.now(),
        amount: Number(amount),
        features,
        senderPhone: phone,
        senderEmail: email,
      });
      setAmount("");
      fetchTransactions();
    } catch (err) {
      alert("Error processing transaction. Check that the backend and ML service are running.");
    }
    setLoading(false);
  };

  const total = transactions.length;
  const flagged = transactions.filter((t) => t.isFraud).length;
  const approved = total - flagged;
  const rate = total ? ((flagged / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="wrap">
      <div className="header">
        <div className="brand">
          <ShieldMark />
          <div>
            <p className="eyebrow">AI Fraud Detection · Blockchain Secured</p>
            <h1 className="title">ChainShield</h1>
            <p className="subtitle">Detect fraud, explain every decision, and lock the record on-chain.</p>
          </div>
        </div>
        <div className="status-pill">
          <span className="status-dot" style={{ background: backendUp ? "#34D399" : "#FB7185", boxShadow: `0 0 8px ${backendUp ? "#34D399" : "#FB7185"}` }} />
          {backendUp ? "Systems online" : "Backend unreachable"}
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <p className="stat-label">Total Transactions</p>
          <p className="stat-value">{total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Flagged</p>
          <p className="stat-value danger">{flagged}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Approved</p>
          <p className="stat-value success">{approved}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Fraud Rate</p>
          <p className="stat-value accent">{rate}%</p>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h2 className="card-title">New Transaction</h2>
          <p className="card-desc">Runs through XGBoost, gets explained by SHAP, and settles on-chain.</p>

          <form onSubmit={handleSubmit}>
            <label>Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)",
                color: "var(--text)", padding: "12px 14px", borderRadius: "10px",
                fontFamily: "var(--font-mono)", fontSize: "14px", outline: "none",
              }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <label>Phone (optional — SMS alert)</label>
            <input
              type="text"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label>Email (optional — email alert)</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit" className="submit" disabled={loading}>
              {loading ? "Processing…" : "Submit Transaction"}
            </button>
          </form>
          <p className="hint">
            Every submission is scored in real time, explained with SHAP, written to the FraudLedger smart contract, and stored in MongoDB.
          </p>
        </div>

        <div>
          <div className="ledger-head">
            <h2 className="card-title" style={{ margin: 0 }}>Transaction Ledger</h2>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>
              {total} record{total !== 1 ? "s" : ""}
            </span>
          </div>

          {transactions.length === 0 && (
            <div className="ledger-empty">No transactions yet — submit one to see it scored and recorded here.</div>
          )}

          {transactions.map((t, i) => {
            const pct = Math.round((t.fraudScore || 0) * 100);
            return (
              <div key={t._id} className={`tx ${t.status} animate-in`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="tx-top">
                  <span className="tx-amount">₹{Number(t.amount).toLocaleString("en-IN")}</span>
                  <span className={`badge ${t.status}`}>{t.status === "flagged" ? "FLAGGED" : "APPROVED"}</span>
                </div>

                <div className="meter-row">
                  <span className="meter-label">Fraud score</span>
                  <div className="meter-track">
                    <div
                      className={`meter-fill ${t.status}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="meter-pct">{pct}%</span>
                </div>

                {t.topReasons && t.topReasons.length > 0 && (
                  <div className="reasons">
                    {t.topReasons.map((r, i) => (
                      <span key={i} className="reason-pill">{r.feature} {r.impact > 0 ? "↑" : "↓"}</span>
                    ))}
                  </div>
                )}

                {t.blockchainTxHash && (
                  <div className="tx-hash">
                    <HashIcon />
                    {truncateHash(t.blockchainTxHash)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LiveConsole;