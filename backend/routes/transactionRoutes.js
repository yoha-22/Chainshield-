const express = require("express");
const axios = require("axios");
const Transaction = require("../models/Transaction");
const { recordTransactionOnChain } = require("../services/blockchainService");
const { triggerFraudAlert } = require("../services/alertService");
const { evaluateThresholds } = require("../services/thresholdEngine");

const router = express.Router();

// POST /api/transaction — main endpoint the React frontend calls
router.post("/transaction", async (req, res) => {
  try {
    const { transactionId, features, amount, senderPhone, senderEmail } = req.body;

    // 1. Call Python ML microservice for fraud prediction
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict`,
      features
    );
    const { fraud_score, is_fraud, top_reasons } = mlResponse.data;

    // 2. Record on blockchain (immutable ledger)
    const blockchainTxHash = await recordTransactionOnChain({
      transactionId,
      amount,
      isFraud: is_fraud,
    });

    // 3. Save to MongoDB
    const transaction = await Transaction.create({
      transactionId,
      amount,
      senderPhone,
      senderEmail,
      fraudScore: fraud_score,
      isFraud: is_fraud,
      topReasons: top_reasons,
      blockchainTxHash,
      status: is_fraud ? "flagged" : "approved",
    });

   // 4. Rule-based threshold check (extra layer on top of the ML model)
    const thresholdResult = await evaluateThresholds(transaction, Transaction);
    if (thresholdResult.triggered) {
      console.log("Threshold rules triggered:", thresholdResult.reasons);
      transaction.thresholdTriggered = true;
      transaction.thresholdReasons = thresholdResult.reasons;
      if (transaction.status === "approved") {
        transaction.status = "flagged";
      }
      await transaction.save();
    }

    // 5. Send alert if ML flagged fraud OR threshold rules triggered
    if (is_fraud || thresholdResult.triggered) {
      await triggerFraudAlert(
        {
          txnId: transaction.transactionId,
          amount: transaction.amount,
          riskScore: fraud_score,
          senderAddress: transaction.blockchainTxHash,
        },
        senderPhone,
        senderEmail
      );
    }

    res.json({
      success: true,
      transaction,
      thresholdTriggered: thresholdResult.triggered,
      thresholdReasons: thresholdResult.reasons,
    });
  } catch (err) {
    console.error("Transaction processing error:", err.message);
    if (err.response) {
      console.error("ML service response status:", err.response.status);
      console.error("ML service response data:", JSON.stringify(err.response.data));
    } else if (err.request) {
      console.error("No response received from ML service. Is Flask running on port 5000?");
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/transactions — fetch all transactions for the dashboard
router.get("/transactions", async (req, res) => {
  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(50);
  res.json(transactions);
});

module.exports = router;