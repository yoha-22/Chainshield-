const { sendSMSAlert, sendEmailAlert, triggerFraudAlert } = require('./alertService');

triggerFraudAlert(
  { txnId: 'TEST123', amount: 50000, riskScore: 92, senderAddress: '0xABC...' },
  process.env.ALERT_PHONE,
  process.env.ALERT_EMAIL
).then(console.log);