import React, { useState } from "react";
import "../styles/chainshield-theme.css";

/**
 * Profile — account info + notification/security toggles.
 * Wire `user` to your auth context and `toggles` to a settings
 * endpoint (PATCH /api/user/settings).
 */
export default function Profile() {
  const user = { name: "Aditi Sharma", email: "aditi@example.com", role: "Analyst", joined: "Jul 2026" };
  const [toggles, setToggles] = useState({ smsAlerts: true, emailAlerts: true, twoFactor: false });

  const flip = (key) => setToggles((t) => ({ ...t, [key]: !t[key] }));

  return (
    <div className="cs-root">
      <div className="cs-ambient" />
      <div className="cs-page" style={{ maxWidth: 720 }}>
        <span className="cs-eyebrow">Account</span>
        <h1 className="cs-h1" style={{ fontSize: 32 }}>Profile</h1>

        <div className="cs-card" style={{ marginTop: 24 }}>
          <div className="cs-row" style={{ gap: 16 }}>
            <Avatar name={user.name} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</div>
              <div className="cs-muted" style={{ fontSize: 13 }}>{user.email}</div>
              <span className="cs-badge cs-badge--info" style={{ marginTop: 6, display: "inline-flex" }}>{user.role}</span>
            </div>
          </div>

          <div className="cs-divider-label">Details</div>
          <div className="cs-grid-2">
            <Field label="Full name" defaultValue={user.name} />
            <Field label="Email" defaultValue={user.email} type="email" />
            <Field label="Phone" placeholder="+91XXXXXXXXXX" />
            <div>
              <div className="cs-muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Member since</div>
              <div style={{ marginTop: 10, fontSize: 14 }}>{user.joined}</div>
            </div>
          </div>
          <button className="cs-btn cs-btn--primary" style={{ marginTop: 4 }}>Save changes</button>
        </div>

        <div className="cs-card" style={{ marginTop: 20 }}>
          <div className="cs-h2" style={{ fontSize: 16 }}>Alerts &amp; security</div>
          <ToggleRow label="SMS alerts on flagged transactions" checked={toggles.smsAlerts} onChange={() => flip("smsAlerts")} />
          <ToggleRow label="Email alerts on flagged transactions" checked={toggles.emailAlerts} onChange={() => flip("emailAlerts")} />
          <ToggleRow label="Two-factor authentication" checked={toggles.twoFactor} onChange={() => flip("twoFactor")} />
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--cs-font-display)",
        fontWeight: 700,
        fontSize: 20,
        color: "#05130f",
        background: "linear-gradient(135deg, var(--cs-teal), var(--cs-violet))",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="cs-field">
      <label className="cs-label">{label}</label>
      <input className="cs-input" {...props} />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="cs-flex-between" style={{ padding: "14px 0", borderTop: "1px solid var(--cs-border)" }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <label className="cs-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="cs-switch-track" />
      </label>
    </div>
  );
}