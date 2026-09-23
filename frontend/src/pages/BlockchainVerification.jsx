import React, { useState } from "react";
import "../styles/chainshield-theme.css";

/**
 * BlockchainVerification — look up a transaction hash and show its
 * position in the chain. Wire `lookup` to your blockchainService,
 * e.g. GET /api/blockchain/:txHash, returning block confirmations.
 */
export default function BlockchainVerification() {
  const [hash, setHash] = useState("");
  const [record, setRecord] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const lookup = (e) => {
    e.preventDefault();
    if (!hash) return;
    // TODO: replace with a real fetch by hash
    setRecord({ ...SAMPLE, hash });
  };

  const copyHash = () => {
    navigator.clipboard?.writeText(record.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page">
        <span className="cs-eyebrow">Blockchain Verification</span>
        <h1 className="cs-h1">Trace an on-chain record</h1>
        <p className="cs-sub">Every verdict ChainShield reaches is written to the ledger. Look one up to confirm it hasn't been altered.</p>

        <form onSubmit={lookup} className="cs-row" style={{ marginTop: 24, maxWidth: 560 }}>
          <input className="cs-input" placeholder="0x7704EBbD6c5712EfF90a7F0ce6025664d58062d6" value={hash} onChange={(e) => setHash(e.target.value)} />
          <button className="cs-btn cs-btn--primary">Verify</button>
        </form>

        <div className="cs-card" style={{ marginTop: 28 }}>
          <div className="cs-flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="cs-muted" style={{ fontSize: 12 }}>Transaction hash</div>
              <div className="cs-row cs-mono" style={{ fontSize: 14, marginTop: 4 }}>
                {truncate(record.hash)}
                <button onClick={copyHash} className="cs-btn cs-btn--ghost" style={{ padding: "4px 10px", fontSize: 11 }} type="button">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div className="cs-row" style={{ color: "var(--cs-teal)" }}>
              <CheckDraw />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Verified · {record.confirmations} confirmations</span>
            </div>
          </div>

          <div className="cs-divider-label">Chain of confirmations</div>
          <div className="cs-chain">
            {record.blocks.map((b, i) => (
              <React.Fragment key={b.id}>
                <div className={`cs-block ${b.verified ? "cs-block--verified" : ""}`} style={{ animationDelay: `${i * 0.12}s` }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>#{b.id}</div>
                    <div style={{ fontSize: 9, marginTop: 2 }}>{b.verified ? "verified" : "pending"}</div>
                  </div>
                </div>
                {i < record.blocks.length - 1 && (
                  <div className={`cs-block-link ${record.blocks[i + 1].verified ? "cs-block-link--verified" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="cs-divider-label">Record detail</div>
          <div className="cs-grid-2">
            <Detail label="Amount" value={`₹${record.amount.toLocaleString("en-IN")}`} />
            <Detail label="Verdict at write time" value={record.verdict} />
            <Detail label="Block timestamp" value={record.timestamp} />
            <Detail label="Network" value={record.network} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="cs-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function truncate(h) {
  if (!h || h.length < 14) return h;
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

function CheckDraw() {
  return (
    <svg className="cs-check" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
      <path d="M5.5 10.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SAMPLE = {
  hash: "0x7704EBbD6c5712EfF90a7F0ce6025664d58062d6",
  confirmations: 24,
  amount: 60000,
  verdict: "Flagged — high amount, round number",
  timestamp: "19 Aug 2026, 09:36 IST",
  network: "Local Ganache (dev)",
  blocks: [
    { id: 1001, verified: true },
    { id: 1002, verified: true },
    { id: 1003, verified: true },
    { id: 1004, verified: true },
    { id: 1005, verified: false },
  ],
};