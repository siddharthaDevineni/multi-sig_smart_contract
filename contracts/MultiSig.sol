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
        owners = _owners;
        required = _confirmations;
    }
}
