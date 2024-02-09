// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract MultiSig {
    address[] public owners; // wallet owners
    uint256 public required; // no. of required confirmations

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
}
