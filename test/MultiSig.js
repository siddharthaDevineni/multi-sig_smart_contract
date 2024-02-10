const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { assert, expect } = require("chai");
const { abi } = require("../artifacts/contracts/MultiSig.sol/MultiSig.json");
const { ethers } = require("hardhat");

describe("MultiSig", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMultiSigFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner1, owner2, owner3, recipient] = await ethers.getSigners();
    let required = 2;
    const MultiSig = await ethers.getContractFactory("MultiSig");
    const multiSig = await MultiSig.deploy([owner1, owner2, owner3], required);
    return {
      MultiSig,
      multiSig,
      owner1,
      owner2,
      owner3,
      required,
      recipient,
    };
  }

  describe("for a valid multisig", () => {
    it("Should set an array of owners", async function () {
      const { multiSig, owner1, owner3 } = await loadFixture(
        deployMultiSigFixture
      );

      await multiSig.waitForDeployment();

      let firstOwner = await multiSig.owners(0);
      let lastOwner = await multiSig.owners(2);
      assert.equal(owner1.address, firstOwner);
      assert.equal(owner3.address, lastOwner);
    });

    it("should set the number of required confirmations", async function () {
      const { multiSig, required } = await loadFixture(deployMultiSigFixture);
      const setnoOfConfirmations = await multiSig.noOfConfirmations();
      assert.equal(required, setnoOfConfirmations);
    });

    it("should define a transactions mapping", async function () {
      const transactions = abi.filter((x) => x.name === "transactions")[0];
      assert(transactions, "transactions mapping is not defined");
      assert.deepEqual(
        transactions.inputs.map((x) => x.type),
        ["uint256"]
      );
      assert.deepEqual(
        transactions.outputs.map((x) => x.type),
        ["address", "uint256", "bool"]
      );
    });

    it("should define a confirmations mapping", async function () {
      const confirmations = abi.filter((x) => x.name === "confirmations")[0];
      assert(confirmations, "confirmations mapping is not defined!");
      assert.deepEqual(
        confirmations.inputs.map((x) => x.type),
        ["uint256", "address"]
      );
      assert.deepEqual(
        confirmations.outputs.map((x) => x.type),
        ["bool"]
      );
    });

    it("should define a transactionCount", async () => {
      const transactionCount = abi.filter(
        (x) => x.name === "transactionCount"
      )[0];
      assert(transactionCount, "uint256 transactionCount is not defined!");
      assert.deepEqual(
        transactionCount.outputs.map((x) => x.type),
        ["uint256"]
      );
    });

    it("should not call addTransaction function externally", async function () {
      const { multiSig } = await loadFixture(deployMultiSigFixture);
      assert.equal(
        multiSig.addTransaction,
        undefined,
        "addTransaction should not be called publicly!"
      );
    });

    it("should create a new Transaction, submit and execute it", async function () {
      const { multiSig, recipient } = await loadFixture(deployMultiSigFixture);
      await multiSig.submitTransaction(
        recipient.address,
        ethers.parseEther("1")
      );
      let trx = await multiSig.transactions(0);
      assert.notEqual(trx.destination, 0);
    });

    it("should confirm a transaction", async function () {
      const { multiSig, recipient } = await loadFixture(deployMultiSigFixture);
      await multiSig.submitTransaction(
        recipient.address,
        ethers.parseEther("1")
      );
      let confirmed = await multiSig.getConfirmationsCount(0);
      assert.equal(confirmed, 1);
    });
  });

  describe("for an invalid multisig with no owners", async () => {
    it("should revert", async () => {
      const { MultiSig } = await loadFixture(deployMultiSigFixture);
      await expect(MultiSig.deploy([], 1)).to.rejectedWith(
        "At least one owner has to be specified!"
      );
    });
  });

  describe("for an invalid multisig with no required confirmations", () => {
    it("should revert", async () => {
      const { MultiSig, owner1, owner2, owner3 } = await loadFixture(
        deployMultiSigFixture
      );
      await expect(MultiSig.deploy([owner1, owner2, owner3], 0)).to.reverted;
    });
  });

  describe("for an invalid multisig with more required confirmations than the no. of owners", () => {
    it("should revert", async () => {
      const { MultiSig, owner1, owner2 } = await loadFixture(
        deployMultiSigFixture
      );
      await expect(MultiSig.deploy([owner1, owner2], 3)).to.reverted;
    });
  });
});
