const hre = require("hardhat");

async function main() {
  const [owner1, owner2, owner3] = await ethers.getSigners();
  let required = 2;
  const MultiSig = await ethers.getContractFactory("MultiSig");
  const multiSig = await MultiSig.deploy([owner1, owner2, owner3], required);
  await multiSig.waitForDeployment();

  console.log(`MultiSig deployed to ${multiSig.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
