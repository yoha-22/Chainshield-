const twilio = require('twilio');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ---------- TWILIO SETUP (lazy-loaded so invalid/placeholder creds don't crash the server) ----------
let twilioClient = null;
function getTwilioClient() {
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

// ---------- SMTP (EMAIL) SETUP ----------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g. smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: false,                      // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,      // Gmail App Password (not normal password)
  },
});

// ---------- ALERT HISTORY LOGGING ----------
// Every alert (SMS or Email, live or mock) gets appended here.
// Useful for a dashboard/history view later.
const HISTORY_FILE = path.join(__dirname, 'alertHistory.json');

function logAlertHistory(entry) {
  let history = [];
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Could not read alert history file, starting fresh:', err.message);
  }
  history.push({ ...entry, timestamp: new Date().toISOString() });
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (err) {
    console.error('Could not write alert history file:', err.message);
  }
}

// ---------- SEND SMS ALERT ----------
// SMS_MODE controls behaviour:
//   'live' -> actually calls Twilio (only works for verified/DLT-approved numbers)
//   'mock' -> simulates sending, logs the exact message that WOULD be sent
// Default to 'mock' if not set, so nothing breaks accidentally in production.
async function sendSMSAlert(toPhone, txnDetails) {
  const mode = (process.env.SMS_MODE || 'mock').toLowerCase();
  const body = `ChainShield Alert! Suspicious Txn Detected. Amount: Rs.${txnDetails.amount} Risk Score: ${txnDetails.riskScore}% Txn ID: ${txnDetails.txnId} Account frozen pending review.`;

  if (mode === 'mock') {
    console.log('[MOCK SMS] Would send to:', toPhone);
    console.log('[MOCK SMS] Message:', body);
    const result = {
      success: true,
      mode: 'mock',
      to: toPhone,
      body,
      note: 'Simulated — live SMS pending Twilio DLT template registration for India (+91) numbers',
    };
    logAlertHistory({ channel: 'sms', ...result });
    return result;
  }

  // live mode
  try {
    const message = await getTwilioClient().messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log('SMS sent:', message.sid);
    const result = { success: true, mode: 'live', sid: message.sid };
    logAlertHistory({ channel: 'sms', to: toPhone, ...result });
    return result;
  } catch (err) {
    console.error('SMS failed:', err.message);
    const result = { success: false, mode: 'live', error: err.message };
    logAlertHistory({ channel: 'sms', to: toPhone, ...result });
    return result;
  }
}

// ---------- SEND EMAIL ALERT ----------
async function sendEmailAlert(toEmail, txnDetails) {
  try {
    const mailOptions = {
      from: `"ChainShield Security" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Fraud Alert - Suspicious Transaction Detected',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d32f2f;">Suspicious Transaction Detected</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td><b>Transaction ID</b></td><td>${txnDetails.txnId}</td></tr>
            <tr><td><b>Amount</b></td><td>Rs.${txnDetails.amount}</td></tr>
            <tr><td><b>Risk Score</b></td><td style="color:red;">${txnDetails.riskScore}%</td></tr>
            <tr><td><b>Sender Address</b></td><td>${txnDetails.senderAddress}</td></tr>
            <tr><td><b>Status</b></td><td>Account Frozen (Blockchain)</td></tr>
            <tr><td><b>Timestamp</b></td><td>${new Date().toLocaleString()}</td></tr>
          </table>
          <p>This action was automatically triggered by ChainShield's AI fraud detection engine.</p>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    const result = { success: true, messageId: info.messageId };
    logAlertHistory({ channel: 'email', to: toEmail, mode: 'live', ...result });
    return result;
  } catch (err) {
    console.error('Email failed:', err.message);
    const result = { success: false, error: err.message };
    logAlertHistory({ channel: 'email', to: toEmail, mode: 'live', ...result });
    return result;
  }
}

// ---------- COMBINED ALERT TRIGGER ----------
async function triggerFraudAlert(txnDetails, alertPhone, alertEmail) {
  const results = await Promise.allSettled([
    sendSMSAlert(alertPhone, txnDetails),
    sendEmailAlert(alertEmail, txnDetails),
  ]);
  return results;
}

module.exports = { sendSMSAlert, sendEmailAlert, triggerFraudAlert };