const { triggerFraudAlert } = require('../services/alertService');

// ... unga existing code (ML API call, blockchain freeze logic) ...

async function processTransaction(req, res) {
  try {
    // ... existing: call Flask ML API, get riskScore ...
    // ... existing: if riskScore > threshold, call smart contract freeze ...

    if (riskScore >= 75) {  // unga threshold adjust pannikonga
      const txnDetails = {
        txnId: transaction._id,
        amount: transaction.amount,
        riskScore: riskScore,
        senderAddress: transaction.senderAddress,
      };

      // 🔔 Trigger SMS + Email alert
      await triggerFraudAlert(
        txnDetails,
        process.env.ALERT_PHONE,
        process.env.ALERT_EMAIL
      );
    }

    res.status(200).json({ success: true, riskScore, /* ...other data */ });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { processTransaction /*, other exports */ };