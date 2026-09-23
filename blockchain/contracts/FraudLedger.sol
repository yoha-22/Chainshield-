// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * ChainShield - FraudLedger Smart Contract
 * ------------------------------------------
 * Records every transaction immutably on-chain.
 * If a transaction is flagged as fraud, the sending account
 * is automatically blacklisted (auto-freeze) pending manual review.
 */
contract FraudLedger {

    struct TransactionRecord {
        string transactionId;
        uint256 amount;
        bool isFraud;
        uint256 timestamp;
    }

    TransactionRecord[] public transactions;
    mapping(address => bool) public blacklisted;

    event TransactionRecorded(
        string transactionId,
        uint256 amount,
        bool isFraud,
        uint256 timestamp
    );

    event AccountFrozen(address indexed account, uint256 timestamp);

    modifier notBlacklisted() {
        require(!blacklisted[msg.sender], "Account is frozen due to suspected fraud");
        _;
    }

    function recordTransaction(
        string memory transactionId,
        uint256 amount,
        bool isFraud
    ) public notBlacklisted {
        transactions.push(
            TransactionRecord(transactionId, amount, isFraud, block.timestamp)
        );

        emit TransactionRecorded(transactionId, amount, isFraud, block.timestamp);

        if (isFraud) {
            blacklisted[msg.sender] = true;
            emit AccountFrozen(msg.sender, block.timestamp);
        }
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 index)
        public
        view
        returns (string memory, uint256, bool, uint256)
    {
        TransactionRecord memory t = transactions[index];
        return (t.transactionId, t.amount, t.isFraud, t.timestamp);
    }

    // Manual admin override to unfreeze an account after review
    function unfreezeAccount(address account) public {
        blacklisted[account] = false;
    }
}
