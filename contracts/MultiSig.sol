// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract MultiSig {
    address[] public owners; // wallet owners
    uint256 public required; // no. of required confirmations
    uint256 public transactionCount; // total no. of transactions stored

    // nested confirmations mapping which maps id (uint) to an owner (address) to
    // whether or not they have confirmed the transaction (bool)
    mapping(uint256 => mapping(address => bool)) public confirmations;

    // Information about a transaction proposed by a owner
    struct Transaction {
        address destination; // recepient address
        uint256 value; // amount to transfer
        bool executed;  // execution status of this transaction
    }

    mapping(uint256 => Transaction) public transactions; // id to its Transaction

    /**
    * @dev When this wallet is deployed it will be configured with the owners addresses
    *      and how many signatures are required to move funds.
    * @param _owners: an array to store wallet owner addresses.
    * @param _confirmations: no. of confirmations required to execute a transaction
    */
    constructor(address[] memory _owners, uint256 _confirmations) {
        require(_owners.length > 0); // making sure there are zero owners for security
        // no. of signatures required has to be non-zero and less than the no. of owners
        require(0 < _confirmations && _confirmations <= _owners.length);
        owners = _owners;
        required = _confirmations;
    }

    /**
    * @dev adds a transaction into the storage map "transactions" and returns the id of that corresponding transaction
    * @param destination: recipient address
    * @param value: amount to be transferred
    * @return transactionId: id of the newly added transaction
    */
    function addTransaction(address destination, uint256 value) public returns(uint256 transactionId) {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction(destination, value, false);
        transactionCount++;
    }

}
