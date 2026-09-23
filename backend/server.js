  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");
  const mongoose = require("mongoose");
  const path = require("path");          // <-- ADD THIS
  const fs = require("fs");               // <-- ADD THIS
  const transactionRoutes = require("./routes/transactionRoutes");
  const { initContract } = require("./services/blockchainService");
  const authRoutes = require("./routes/authRoutes");

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api", transactionRoutes);
  app.use("/api/auth", authRoutes);

  // ---------- ADD THIS BLOCK ----------
  // Serve dashboard.html from backend/public
  app.use(express.static(path.join(__dirname, "public")));

  // API route that returns the alert history JSON for the dashboard
  app.get("/api/alerts", (req, res) => {
    const historyPath = path.join(__dirname, "services", "alertHistory.json");
    fs.readFile(historyPath, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          return res.json([]);
        }
        console.error("Failed to read alert history:", err.message);
        return res.status(500).json({ error: "Could not read alert history" });
      }
      try {
        res.json(JSON.parse(data));
      } catch (parseErr) {
        console.error("Failed to parse alert history:", parseErr.message);
        res.status(500).json({ error: "Alert history file is corrupted" });
      }
    });
  });
  // ---------- END BLOCK ----------

  app.get("/", (req, res) => {
    res.send("ChainShield backend is running.");
  });

  const PORT = process.env.PORT || 4000;

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
      initContract();
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("MongoDB connection failed:", err.message));