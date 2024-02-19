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
  const owner2 = "0x99f369CaAaB302856420a875E4dd5c97c8113c43";
  const owner3 = "0x83A663f5BEf6fc2CfA5dd0DEDC4f02285E8cAaDB";
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
