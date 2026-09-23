const FraudLedger = artifacts.require("FraudLedger");

module.exports = function (deployer) {
  deployer.deploy(FraudLedger);
};
