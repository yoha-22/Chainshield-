import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "./styles/chainshield-theme.css";

// Your original, already-working page (unchanged logic) — lives at /console
import LiveConsole from "./pages/LiveConsole";

// New pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import UploadFile from "./pages/UploadFile";
import AIPrediction from "./pages/AIPrediction";
import BlockchainVerification from "./pages/BlockchainVerification";
import Dashboard from "./pages/Dashboard";
import TransactionHistory from "./pages/TransactionHistory";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/console", label: "Live Console" },
  { to: "/login", label: "Login" },
  { to: "/upload", label: "Upload" },
  { to: "/predict", label: "AI Prediction" },
  { to: "/verify", label: "Blockchain" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
  { to: "/admin", label: "Admin" },
];

function NavBar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        gap: 4,
        overflowX: "auto",
        padding: "12px 20px",
        background: "rgba(10, 14, 20, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--cs-border)",
      }}
    >
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          style={({ isActive }) => ({
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "var(--cs-font-body)",
            textDecoration: "none",
            color: isActive ? "var(--cs-teal)" : "var(--cs-text-secondary)",
            background: isActive ? "var(--cs-teal-dim)" : "transparent",
            transition: "background 0.15s ease, color 0.15s ease",
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/console" element={<LiveConsole />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="/predict" element={<AIPrediction />} />
        <Route path="/verify" element={<BlockchainVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<TransactionHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;