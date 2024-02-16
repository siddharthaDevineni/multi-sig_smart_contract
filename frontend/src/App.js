import { useState, useEffect } from "react";
import "./App.css";
import ABI from "./contracts/MultiSig.json";
import { ethers, formatEther } from "ethers";

const multisigAddress = "0xfA9349fe6A4DC98435D8067cC3a59298243D9453";

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
  const [ownerBalance, setOwnerBalance] = useState();
  const [contractBalance, setContractBalance] = useState();
  const [fundTheContract, setFundTheContract] = useState();
  const [beneficiary, setBeneficiary] = useState();
  const [amountToSend, setAmountToSend] = useState();
  const [userInfo, setUserInfo] = useState();

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
        setOwnerBalance(
          ethers.formatUnits(
            await window.ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            }),
            "ether"
          )
        );
      } catch (error) {
        alert(`Error: ` + error);
      }
    } else {
      alert(
        `You must install Metamask extension, a virtual Ethereum wallet from ${`https://metamask.io/download.html`}`
      );
    }
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

  const contractInteraction = async () => {
    if (window.ethereum) {
      try {
        setContractBalance(
          ethers.formatUnits(
            await window.ethereum.request({
              method: "eth_getBalance",
              params: [multisigAddress, "latest"],
            }),
            "ether"
          )
        );
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const multiSig = new ethers.Contract(multisigAddress, ABI.abi, signer);
      } catch (error) {
        alert(`Error: ` + error);
      }
    } else {
      alert(
        `You must install Metamask extension, a virtual Ethereum wallet from ${`https://metamask.io/download.html`}`
      );
    }
  };

  useEffect(() => {
    checkWalletIsConnected();
    checkCurrentAccount();
    contractInteraction();
  }, []);

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
          <button>Fund the contract</button>
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
            type="text"
            placeholder="Enter the amount to transfer to the beneficiary."
            onChange={(e) => setAmountToSend(e.target.value)}
          ></input>
        </div>
      </header>
    </div>
  );
}

export default App;
