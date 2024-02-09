const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSig", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMultiSigFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner1, owner2, owner3] = await ethers.getSigners();
    let required = 2;
    const MultiSig = await ethers.getContractFactory("MultiSig");
    const multiSig = await MultiSig.deploy([owner1, owner2, owner3], required);
    return { multiSig, owner1, owner2, owner3 };
  }

  it("Should set an array of owners", async function () {
    const { multiSig, owner1, owner2, owner3 } = await loadFixture(
      deployMultiSigFixture
    );

    await multiSig.waitForDeployment();

    let firstOwner = await multiSig.owners(0);
    let lastOwner = await multiSig.owners(2);
    assert.equal(owner1.address, firstOwner);
    assert.equal(owner3.address, lastOwner);
  });
});