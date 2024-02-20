const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { assert, expect } = require("chai");
const {
  abi,
} = require("../app/src/artifacts/contracts/MultiSig.sol/MultiSig.json");
const { ethers } = require("hardhat");

describe("MultiSig", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMultiSigFixture() {
    const [owner1, owner2, owner3, recipient, recipient2] =
      await ethers.getSigners();
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
      recipient2,
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
      const setnoOfReqConfirmations = await multiSig.noOfReqConfirmations();
      assert.equal(required, setnoOfReqConfirmations);
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

    it("should define a isOwnerSignedTrx mapping", async function () {
      const isOwnerSignedTrx = abi.filter(
        (x) => x.name === "isOwnerSignedTrx"
      )[0];
      assert(isOwnerSignedTrx, "isOwnerSignedTrx mapping is not defined!");
      assert.deepEqual(
        isOwnerSignedTrx.inputs.map((x) => x.type),
        ["uint256", "address"]
      );
      assert.deepEqual(
        isOwnerSignedTrx.outputs.map((x) => x.type),
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

    it("submitTransaction should add a new Transaction", async function () {
      const { multiSig, recipient } = await loadFixture(deployMultiSigFixture);
      await multiSig.submitTransaction(
        recipient.address,
        ethers.parseEther("1")
      );
      let trx = await multiSig.transactions(0);
      assert.notEqual(trx.destination, 0);
    });

    it("should accept funds", async function () {
      const { multiSig, owner1 } = await loadFixture(deployMultiSigFixture);
      const value = ethers.parseEther("1");
      await owner1.sendTransaction({
        to: multiSig.target,
        value,
      });
      const balance = await ethers.provider.getBalance(multiSig.target);
      assert.equal(balance.toString(), value.toString());
    });

    it("isConfirmed should return true if the required threshold is met for a transaction", async function () {
      const { multiSig, owner1, owner2, recipient } = await loadFixture(
        deployMultiSigFixture
      );
      await owner1.sendTransaction({
        to: multiSig.target,
        value: ethers.parseEther("2"),
      });
      await multiSig
        .connect(owner1)
        .submitTransaction(recipient.address, ethers.parseEther("1"));
      await multiSig.connect(owner2).confirmTransaction(0); // second confirmation from owner2
      const confirmed = await multiSig.isConfirmed(0);

      assert.equal(confirmed, true);
    });

    it("isConfirmed should return false if the required threshold is not met for a transaction", async function () {
      const { multiSig, owner1, owner2 } = await loadFixture(
        deployMultiSigFixture
      );
      await multiSig.connect(owner1).confirmTransaction(0);
      const confirmed = await multiSig.isConfirmed(0);

      assert.equal(confirmed, false);
    });

    it("submitTransaction should confirm a newly added transaction once", async function () {
      const { multiSig, recipient } = await loadFixture(deployMultiSigFixture);
      await multiSig.submitTransaction(
        recipient.address,
        ethers.parseEther("1")
      );
      let confirmed = await multiSig.getConfirmationsCount(0);
      assert.equal(confirmed, 1);
    });

    it("submitTransaction should execute a transaction if confirmation threshold is met", async function () {
      const { multiSig, owner1, owner2, recipient } = await loadFixture(
        deployMultiSigFixture
      );
      await owner1.sendTransaction({
        to: multiSig.target,
        value: ethers.parseEther("2"),
      }); // fund the multisig wallet first
      await multiSig
        .connect(owner1)
        .submitTransaction(recipient.address, ethers.parseEther("1"));
      await multiSig.connect(owner2).confirmTransaction(0); // second confirmation from owner2 executes the transaction

      let txn = await multiSig.transactions(0);
      assert.equal(txn[2], true, "Expected `executed` bool to be true!");
    });

    it("should transfer the amount to recipient after execution", async function () {
      const { multiSig, owner1, owner2, recipient } = await loadFixture(
        deployMultiSigFixture
      );
      await owner1.sendTransaction({
        to: multiSig.target,
        value: ethers.parseEther("2"),
      }); // fund the multisig wallet first
      await multiSig
        .connect(owner1)
        .submitTransaction(recipient.address, ethers.parseEther("1"));
      await multiSig.connect(owner2).confirmTransaction(0); // second confirmation from owner2 executes the transaction

      let txn = await multiSig.transactions(0);
      assert.equal(
        txn[1],
        ethers.parseEther("1"),
        "Expected to receive 1 Ether!"
      );
    });

    it.only("should transfer the amount to another recipient after second execution", async function () {
      const { multiSig, owner1, owner2, recipient, recipient2 } =
        await loadFixture(deployMultiSigFixture);
      await owner1.sendTransaction({
        to: multiSig.target,
        value: ethers.parseEther("3"),
      }); // fund the multisig wallet first
      await multiSig
        .connect(owner1)
        .submitTransaction(recipient.address, ethers.parseEther("1"));
      await multiSig.connect(owner2).confirmTransaction(0); // second confirmation from owner2 executes the transaction

      let txn = await multiSig.transactions(0);
      assert.equal(
        txn[1],
        ethers.parseEther("1"),
        "Expected first recepient to receive 1 Ether!"
      );

      await multiSig
        .connect(owner1)
        .submitTransaction(recipient2.address, ethers.parseEther("1.5"));
      await multiSig.connect(owner2).confirmTransaction(1); // second confirmation from owner2 executes the transaction

      let txn2 = await multiSig.transactions(1); // trxId 1
      assert.equal(
        txn2[1],
        ethers.parseEther("1.5"),
        "Expected second recipient to receive 1.5 Ether!"
      );
    });

    it("submitTransaction should not execute a transaction if confirmation threshold is not met", async function () {
      const { multiSig, owner1, owner2, recipient } = await loadFixture(
        deployMultiSigFixture
      );
      await owner1.sendTransaction({
        to: multiSig.target,
        value: ethers.parseEther("2"),
      }); // fund the multisig wallet first
      await multiSig
        .connect(owner1)
        .submitTransaction(recipient.address, ethers.parseEther("1"));

      let txn = await multiSig.transactions(0);
      assert.equal(txn[2], false, "Expected `executed` bool to be true!");
    });

    it("should revert when the same owner double confirms the same transaction", async () => {
      const { multiSig, owner1 } = await loadFixture(deployMultiSigFixture);
      await multiSig.connect(owner1).confirmTransaction(0);
      await expect(multiSig.connect(owner1).confirmTransaction(0)).to.reverted; // double confirming
    });
  });

  describe("for an invalid multisig with no owners", async () => {
    it("should revert", async () => {
      const { MultiSig } = await loadFixture(deployMultiSigFixture);
      await expect(MultiSig.deploy([], 1)).to.revertedWith(
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
