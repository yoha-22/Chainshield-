const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

// Connect to local Ganache blockchain (or testnet RPC URL from .env)
const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:7545");

// Load contract artifact (generated after Truffle compile)
// Just copy the WHOLE blockchain/build/contracts/FraudLedger.json file here,
// no need to manually extract the "abi" part - we do that automatically below.
const contractArtifactPath = path.join(__dirname, "../contracts/FraudLedger.json");
let contract = null;

function initContract() {
  if (!fs.existsSync(contractArtifactPath)) {
    console.warn(
      "Contract artifact not found. Compile & deploy the smart contract first, " +
      "then copy blockchain/build/contracts/FraudLedger.json to backend/contracts/FraudLedger.json"
    );
    return;
  }
  const artifact = JSON.parse(fs.readFileSync(contractArtifactPath, "utf8"));
  const abi = artifact.abi; // automatically extracted, no manual copy-paste needed
  contract = new web3.eth.Contract(abi, process.env.CONTRACT_ADDRESS);
  console.log("Smart contract connected at", process.env.CONTRACT_ADDRESS);
}

async function recordTransactionOnChain({ transactionId, amount, isFraud }) {
  if (!contract) {
    console.warn("Contract not initialized — skipping blockchain record.");
    return null;
  }
  try {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods
      .recordTransaction(transactionId, amount, isFraud)
      .send({ from: accounts[0], gas: 300000 });

    console.log("Transaction recorded on blockchain:", receipt.transactionHash);
    return receipt.transactionHash;
  } catch (err) {
    console.error("Blockchain recording failed:", err.message);
    return null;
  }
}

module.exports = { initContract, recordTransactionOnChain };