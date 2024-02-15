const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const url = process.env.GOERLI_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const provider = new hre.ethers.AlchemyProvider(
    "goerli",
    process.env.GOERLI_API_KEY
  );
  const ABI = await hre.artifacts.readArtifact("MultiSig");
  const [owner1] = await ethers.getSigners(); // My wallet public address
  const owner2 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const owner3 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  let required = 2;

  const wallet = new ethers.Wallet(privateKey, provider);
  const MultiSig = new ethers.ContractFactory(ABI.abi, ABI.bytecode, wallet);
  const multiSig = await MultiSig.deploy([owner1, owner2, owner3], required);
  await multiSig.waitForDeployment();

  console.log(
    `MultiSig deployed on goerli at https://goerli.etherscan.io/address/${await multiSig.getAddress()}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log("Error: ", e);
    process.exit(1);
  });
