// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract MultiSig {
    address[] public owners; // wallet owners
    uint256 public noOfConfirmations; // no. of required confirmations
    uint256 public transactionCount; // total no. of transactions stored

    // Nested confirmations mapping which maps id (uint) to an owner (address) to
    // whether or not they have confirmed the transaction (bool)
    mapping(uint256 => mapping(address => bool)) public confirmations;

    // Information about a transaction proposed by an owner
    struct Transaction {
        address destination; // recepient address
        uint256 value; // amount to transfer
        bool executed;  // execution status of this transaction
        // bytes data; // bytecode calldata to send
    }

    mapping(uint256 => Transaction) public transactions; // id to its Transaction
    mapping(uint256 => uint256) private trxConfirmationsCount; // the no. of times a trx is confirmed

    /**
    *  When this wallet is deployed it will be configured with the owners addresses
    *      and how many signatures are required to move funds.
    * @param _owners an array to store wallet owner addresses.
    * @param _noOfconfirmations no. of confirmations required to execute a transaction
    */
    constructor(address[] memory _owners, uint256 _noOfconfirmations) {
        require(_owners.length > 0, "At least one owner has to be specified!"); // making sure there are non-zero owners for security
        // no. of signatures required has to be non-zero and less than the no. of owners
        require(_noOfconfirmations > 0, "No. of signtures required should be non-zero");
        require(_noOfconfirmations <= _owners.length, "No. of signatures required should not be more than the no. of Owners!");
        owners = _owners;
        noOfConfirmations = _noOfconfirmations;
    }

    /**
    * Adds a transaction into the storage map "transactions" and returns the id of that corresponding transaction
    * @param destination recipient address
    * @param value amount to be transferred
    * @return trxId id of the newly added transaction
    */
    function addTransaction(address destination, uint256 value) internal returns(uint256 trxId) {
        trxId = transactionCount;
        transactions[trxId] = Transaction(destination, value, false);
        transactionCount++;
    }

    /**
     * Transaction confirmation/execution security: this modifier checks if the caller is one of the owners
     */
    modifier onlyOwners(){
        bool isOwner;
        for(uint256 i = 0; i < owners.length; i++) {
            if(msg.sender == owners[i])
            {
                isOwner = true;
            }
        }
        require(isOwner, "You are not an authorised Owner!");
        _;
    }

    /**
     * Creates a confirmation for the transaction from the caller (msg.sender) who must be one of the owners
     * This also executes the transaction once it has enough signatures (confirmed transaction).
     * @param trxId id of a transaction
     */
    function confirmTransaction(uint256 trxId) public onlyOwners(){
        confirmations[trxId][msg.sender] = true;
        trxConfirmationsCount[trxId]++;
        if (isConfirmed(trxId)) {
            executeTransaction(trxId);
        }
    }

    /**
     * Getter for the no. of times a given transaction by its Id is confirmed by the owners
     * @param trxId the transaction Id
     * @return trxConfirmationsCount the confirmation count of a given transaction.
     */
    function getConfirmationsCount(uint256 trxId) public view returns(uint256){
        return trxConfirmationsCount[trxId];
    }

    /**
     * Creates a new transaction, adds it to the storage and confirms it
     * @param destination address of the recipient
     * @param value amoun to be transferred
     */
    function submitTransaction(address destination, uint256 value) external onlyOwners(){
        confirmTransaction(addTransaction(destination, value));
    }
    
    /**
     * An external payable receive function that allows Multi-Sig wallet to accept funds at any time
     */
    receive() external payable{}

    /**
     * Getter whether a trx is confirmed/not based on the no. of required confirmations
     * @param trxId transaction Id
     */
    function isConfirmed(uint256 trxId) public view returns(bool _isConfirmed){
        if (getConfirmationsCount(trxId) >= noOfConfirmations) {
            _isConfirmed = true;
        }
    }

    /**
     * Executes a transaction when it has reached a required amount of signatures
     * Execution results in transferring the amount and the call data to the destination (recipient)
     * @param trxId the transaction Id
     */
    function executeTransaction(uint256 trxId) private{
        require(isConfirmed(trxId), "Transaction is not confirmed yet!");
        (bool success, ) = transactions[trxId].destination.call{value: transactions[trxId].value}("");
        require(success, "Failed to execute transaction");
        transactions[trxId].executed = true;
    }

}
