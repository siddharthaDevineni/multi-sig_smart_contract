import { useState, useEffect } from "react";
import "./App.css";
import ABI from "./contracts/MultiSig.json";
import { ethers, formatEther, getAddress } from "ethers";

const multisigAddress = "0xeDaffB2aE995A78DCeFe1056B6DCf56d7C235aCC";

function App() {
  // functions to add in the UI
  // state variable for storing the owner
  // state variables for entering recipient and the amount to send
  // state variable to send some ETH to the contract as a pool from different owners
  // submit a transaction from an owner
  // confirm the above transaction by an other owner
  // check the funds in the contract before and after
  // check the funds of the recipient before and after

  const [owner, setOwner] = useState();
  const [ownerBalance, setOwnerBalance] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const [fundTheContract, setFundTheContract] = useState("");
  const [beneficiary, setBeneficiary] = useState();
  const [amountToSend, setAmountToSend] = useState();
  const [userInfo, setUserInfo] = useState("");
  const [contract, SetContract] = useState();

  const checkCurrentAccount = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        checkWalletIsConnected();
      });
    }
  };

  const checkWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setOwner(accounts[0]);
        console.log("owner addr: ", accounts[0]);
        updateBalances();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        SetContract(new ethers.Contract(multisigAddress, ABI.abi, signer));
        console.log("contract addr: ");
        if (contract) {
          contract.on("Transfer", () => {
            updateBalances();
          });
        }
      } catch (error) {
        alert(`Error: ` + `${error.message}`);
      }
    } else {
      let link = "https://metamask.io/download.html";
      alert(
        `Please install and connect to Metamask extension, a virtual Ethereum wallet from ` +
          `${link}`
      );
    }
  };

  const updateBalances = async () => {
    setOwnerBalance(
      ethers.formatUnits(
        await window.ethereum.request({
          method: "eth_getBalance",
          params: [owner, "latest"],
        }),
        "ether"
      )
    );
    setContractBalance(
      ethers.formatEther(
        await window.ethereum.request({
          method: "eth_getBalance",
          params: [multisigAddress, "latest"],
        })
      )
    );
  };

  const connectWalletButton = () => {
    return (
      <button className="button" onClick={checkWalletIsConnected}>
        {owner ? (
          "Connected: " +
          String(owner).substring(0, 6) +
          "..." +
          String(owner).substring(38)
        ) : (
          <span>Connect to Metamask</span>
        )}
      </button>
    );
  };

  const fundTheContractButton = () => {
    return (
      <button
        style={{ visibility: fundTheContract ? "visible" : "hidden" }}
        className="button"
        onClick={sendFundsToTheContract}
      >
        Send deposits!
      </button>
    );
  };

  const sendFundsToTheContract = async () => {
    if (owner && fundTheContract) {
      let depositInWei = ethers.parseEther(fundTheContract);
      try {
        const trxHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: multisigAddress,
              from: owner,
              value: ethers.toQuantity(depositInWei),
            },
          ],
        });
        const trxReceipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [trxHash.toString()],
        });
      } catch (error) {
        alert(`Error: ` + `${error.message}`);
      }
    }
  };

  useEffect(() => {
    checkCurrentAccount();
    checkWalletIsConnected();
  }, [ownerBalance, contractBalance]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Welcome to the Multi-Signature Decentraziled App</h2>
        <div>{connectWalletButton()}</div>
        <div className="owner">
          <label>Connected owner's address: {owner}</label>
          <label>Connected owner's balance: {ownerBalance + " ETH"}</label>
        </div>
        <div className="contract">
          <label>Contract address: {multisigAddress}</label>
          <label>Contract balance: {contractBalance + " ETH"}</label>
          <input
            type="number"
            placeholder="Deposit in ETH to the contract...."
            onChange={(e) => setFundTheContract(e.target.value)}
          ></input>
          <div>{fundTheContractButton()}</div>
        </div>
        <div className="beneficiary">
          <p>Beneficiary address: </p>
          <input
            type="text"
            placeholder="Enter your beneficiary address."
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <label>Enter the amount in ETH</label>
          <input
            type="number"
            placeholder="Enter the amount to transfer to the beneficiary."
            onChange={(e) => setAmountToSend(e.target.value)}
          ></input>
        </div>
      </header>
    </div>
  );
}

export default App;
