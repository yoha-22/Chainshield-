import React, { useState } from "react";
import axios from "axios";
import "../styles/chainshield-theme.css";

const API_URL = "http://localhost:4000/api";

/**
 * Login / Register — single component, toggled by a tab.
 * Now wired to POST /api/auth/login and /api/auth/register.
 * On success, stores the JWT in localStorage as "chainshield_token".
 */
export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register" && form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const payload =
        mode === "register"
          ? { name: form.name, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const { data } = await axios.post(`${API_URL}/auth/${mode}`, payload);

      localStorage.setItem("chainshield_token", data.token);
      localStorage.setItem("chainshield_user", JSON.stringify(data.user));
      setSuccess(mode === "register" ? "Account created. You're signed in." : "Signed in.");
      setForm({ name: "", email: "", password: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Check that the backend is running.");
    }
    setSubmitting(false);
  };

  return (
    <div className="cs-root" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div className="cs-ambient" />
      <div style={{ width: "100%", maxWidth: 400, padding: "24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <BreathingShield />
          <div className="cs-h2" style={{ marginTop: 12 }}>ChainShield</div>
          <p className="cs-muted">Sign in to review flagged activity on your account.</p>
        </div>

        <div className="cs-card">
          {/* Tabs */}
          <div
            className="cs-row"
            style={{
              background: "var(--cs-surface)",
              border: "1px solid var(--cs-border)",
              borderRadius: 10,
              padding: 4,
              marginBottom: 22,
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className="cs-btn"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  background: mode === m ? "var(--cs-teal-dim)" : "transparent",
                  color: mode === m ? "var(--cs-teal)" : "var(--cs-text-secondary)",
                  border: "none",
                }}
                type="button"
              >
                {m === "login" ? "Log in" : "Register"}
              </button>
            ))}
          </div>

          {/* autoComplete="off" on the form + unique names stop Chrome from
              re-suggesting a previously saved login here */}
          <form onSubmit={handleSubmit} key={mode} autoComplete="off">
            {mode === "register" && (
              <div className="cs-field">
                <label className="cs-label">Full name</label>
                <input
                  className="cs-input"
                  name="cs-name-field"
                  autoComplete="off"
                  placeholder="Aditi Sharma"
                  value={form.name}
                  onChange={update("name")}
                  required
                />
              </div>
            )}
            <div className="cs-field">
              <label className="cs-label">Email</label>
              <input
                className="cs-input"
                name="cs-email-field"
                type="email"
                autoComplete="off"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>
            <div className="cs-field">
              <label className="cs-label">Password</label>
              <input
                className="cs-input"
                name="cs-password-field"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={update("password")}
                required
              />
            </div>
            {mode === "register" && (
              <div className="cs-field">
                <label className="cs-label">Confirm password</label>
                <input
                  className="cs-input"
                  name="cs-confirm-field"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={update("confirm")}
                  required
                />
              </div>
            )}

            {error && (
              <p style={{ color: "var(--cs-red)", fontSize: 13, marginBottom: 14 }}>{error}</p>
            )}
            {success && (
              <p style={{ color: "var(--cs-teal)", fontSize: 13, marginBottom: 14 }}>{success}</p>
            )}

            <button className="cs-btn cs-btn--primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={submitting}>
              {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="cs-muted" style={{ textAlign: "center", marginTop: 16, fontSize: 12 }}>
          Protected by ChainShield's fraud engine · verdicts settle on-chain
        </p>
      </div>
    </div>
  );
}

function BreathingShield() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ margin: "0 auto" }}>
      <path
        d="M22 3 L38 9 V21 C38 31 31 38 22 41 C13 38 6 31 6 21 V9 Z"
        fill="var(--cs-teal-dim)"
        stroke="var(--cs-teal)"
        strokeWidth="1.6"
      >
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.6s" repeatCount="indefinite" />
      </path>
      <path d="M15 22 L20 27 L29 16" stroke="var(--cs-teal)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}