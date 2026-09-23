import React, { useState, useRef } from "react";
import "../styles/chainshield-theme.css";

/**
 * UploadFile — drag-and-drop transaction batch upload (CSV / JSON).
 * Wire handleFiles to POST a FormData payload to your backend, and
 * replace the fake progress timer with real upload progress.
 */
export default function UploadFile() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}`,
      name: f.name,
      size: f.size,
      progress: 0,
      status: "uploading",
    }));
    setFiles((prev) => [...incoming, ...prev]);
    incoming.forEach((f) => simulateUpload(f.id));
  };

  const simulateUpload = (id) => {
    // TODO: swap for real upload progress (axios onUploadProgress, etc.)
    const tick = () => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id || f.status !== "uploading") return f;
          const next = Math.min(100, f.progress + Math.random() * 22 + 8);
          return { ...f, progress: next, status: next >= 100 ? "done" : "uploading" };
        })
      );
    };
    const interval = setInterval(() => {
      tick();
    }, 260);
    setTimeout(() => clearInterval(interval), 2200);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page">
        <span className="cs-eyebrow">Batch Ingestion</span>
        <h1 className="cs-h1">Upload transactions</h1>
        <p className="cs-sub">Drop a CSV or JSON export and ChainShield will queue every row for scoring.</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="cs-card"
          style={{
            marginTop: 28,
            border: `1.5px dashed ${dragging ? "var(--cs-teal)" : "var(--cs-border)"}`,
            background: dragging ? "var(--cs-teal-dim)" : "var(--cs-surface-raised)",
            textAlign: "center",
            padding: "56px 24px",
            cursor: "pointer",
            transition: "border-color 0.15s ease, background 0.15s ease",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            accept=".csv,.json"
            onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
          />
          <UploadGlyph active={dragging} />
          <div className="cs-h2" style={{ marginTop: 14, fontSize: 17 }}>
            {dragging ? "Release to upload" : "Drag a file here, or click to browse"}
          </div>
          <p className="cs-muted" style={{ marginTop: 4 }}>.csv or .json · one transaction per row</p>
        </div>

        {files.length > 0 && (
          <>
            <div className="cs-divider-label">Queue</div>
            <div className="cs-stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {files.map((f) => (
                <div className="cs-card" key={f.id} style={{ padding: 16 }}>
                  <div className="cs-flex-between">
                    <div className="cs-row">
                      <FileGlyph />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                        <div className="cs-muted" style={{ fontSize: 12 }}>{formatSize(f.size)}</div>
                      </div>
                    </div>
                    <span className={`cs-badge ${f.status === "done" ? "cs-badge--approved" : "cs-badge--info"}`}>
                      {f.status === "done" ? "Ready" : "Uploading"}
                    </span>
                  </div>
                  <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: "var(--cs-surface)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${f.progress}%`,
                        borderRadius: 999,
                        background: f.status === "done" ? "var(--cs-teal)" : "linear-gradient(90deg, var(--cs-violet), var(--cs-teal))",
                        transition: "width 0.25s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadGlyph({ active }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: "0 auto" }}>
      <path
        d="M20 26V6M20 6l-7 7M20 6l7 7"
        stroke={active ? "var(--cs-teal)" : "var(--cs-text-secondary)"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.15s ease", transform: active ? "translateY(-2px)" : "none" }}
      />
      <path d="M6 30v3a3 3 0 003 3h22a3 3 0 003-3v-3" stroke={active ? "var(--cs-teal)" : "var(--cs-text-secondary)"} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function FileGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="5" y="3" width="18" height="22" rx="3" fill="var(--cs-surface)" stroke="var(--cs-border)" />
      <path d="M9 10h10M9 14h10M9 18h6" stroke="var(--cs-text-secondary)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}