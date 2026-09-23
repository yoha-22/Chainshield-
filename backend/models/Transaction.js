const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  senderPhone: { type: String },
  senderEmail: { type: String },
  fraudScore: { type: Number, required: true },
  isFraud: { type: Boolean, required: true },
  topReasons: [{ feature: String, impact: Number }],
  blockchainTxHash: { type: String },
  status: { type: String, enum: ["approved", "flagged"], required: true },
  thresholdTriggered: { type: Boolean, default: false },
  thresholdReasons: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);