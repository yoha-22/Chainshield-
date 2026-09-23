/**
 * thresholdEngine.js
 * Rule-based fraud alert thresholds for ChainShield.
 * Works alongside the existing ML fraudScore — these are extra,
 * explainable "hard rules" that trigger alerts on top of the model.
 *
 * Usage:
 *   const { evaluateThresholds } = require("./thresholdEngine");
 *   const result = await evaluateThresholds(transaction, Transaction);
 *   // result = { triggered: true/false, reasons: ["HIGH_AMOUNT", "VELOCITY"] }
 */

// ---------- CONFIG: tune these values for your demo ----------
const CONFIG = {
  HIGH_AMOUNT: 50000, // ₹ - flag if transaction amount exceeds this
  FRAUD_SCORE_THRESHOLD: 0.75, // secondary check on top of isFraud flag
  VELOCITY_COUNT: 5, // max transactions allowed in the window below
  VELOCITY_WINDOW_MINUTES: 10,
  ODD_HOUR_START: 1, // 1 AM
  ODD_HOUR_END: 5, // 5 AM
  ROUND_NUMBER_STEP: 10000, // flags amounts that are exact multiples of this
};

// ---------- Individual rule checks ----------

function checkHighAmount(transaction) {
  return transaction.amount >= CONFIG.HIGH_AMOUNT;
}

function checkFraudScore(transaction) {
  return transaction.fraudScore >= CONFIG.FRAUD_SCORE_THRESHOLD;
}

function checkOddHour(transaction) {
  const hour = new Date(transaction.createdAt || Date.now()).getHours();
  return hour >= CONFIG.ODD_HOUR_START && hour < CONFIG.ODD_HOUR_END;
}

function checkRoundNumber(transaction) {
  return (
    transaction.amount > 0 &&
    transaction.amount % CONFIG.ROUND_NUMBER_STEP === 0
  );
}

// Velocity check needs DB access — count recent transactions from same sender
async function checkVelocity(transaction, TransactionModel) {
  if (!transaction.senderPhone && !transaction.senderEmail) return false;

  const windowStart = new Date(
    Date.now() - CONFIG.VELOCITY_WINDOW_MINUTES * 60 * 1000
  );

  const query = {
    createdAt: { $gte: windowStart },
    $or: [],
  };
  if (transaction.senderPhone) query.$or.push({ senderPhone: transaction.senderPhone });
  if (transaction.senderEmail) query.$or.push({ senderEmail: transaction.senderEmail });

  const recentCount = await TransactionModel.countDocuments(query);
  return recentCount >= CONFIG.VELOCITY_COUNT;
}

// ---------- Main evaluator ----------

/**
 * Evaluates a transaction against all threshold rules.
 * @param {Object} transaction - a transaction document (or plain object with same fields)
 * @param {Object} TransactionModel - mongoose Transaction model (needed for velocity check)
 * @returns {Promise<{triggered: boolean, reasons: string[]}>}
 */
async function evaluateThresholds(transaction, TransactionModel) {
  const reasons = [];

  if (checkHighAmount(transaction)) reasons.push("HIGH_AMOUNT");
  if (checkFraudScore(transaction)) reasons.push("HIGH_FRAUD_SCORE");
  if (checkOddHour(transaction)) reasons.push("ODD_HOUR_ACTIVITY");
  if (checkRoundNumber(transaction)) reasons.push("ROUND_NUMBER_AMOUNT");

  if (TransactionModel) {
    const velocityFlag = await checkVelocity(transaction, TransactionModel);
    if (velocityFlag) reasons.push("VELOCITY_ANOMALY");
  }

  return {
    triggered: reasons.length > 0,
    reasons,
  };
}

module.exports = {
  evaluateThresholds,
  CONFIG, // exported so you can tweak values at runtime if needed
};