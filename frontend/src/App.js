import { useState, useEffect } from "react";
import "./App.css";
import ABI from "./contracts/MultiSig.json";
import { ethers, formatEther } from "ethers";

const multisigAddress = "0xfA9349fe6A4DC98435D8067cC3a59298243D9453";
const provider = new ethers.BrowserProvider(window.ethereum);

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
  const [fundTheContract, setFundTheContract] = useState();
  const [beneficiary, setBeneficiary] = useState();
  const [amountToSend, setAmountToSend] = useState();
  const [userInfo, setUserInfo] = useState();
  const [contractBalance, setContractBalance] = useState();

  const checkWalletIsConnected = async () => {
    if (provider) {
      try {
        await provider
          .send("eth_requestAccounts", [])
          .then(async () => await accountChangeHandler(provider.getSigner()));
      } catch (error) {}
    } else {
      alert(
        `You must install Metamask extension, a virtual Ethereum wallet from ${`https://metamask.io/download.html`}`
      );
    }
  };

  const accountChangeHandler = async (accountChanged) => {
    setOwner(accountChanged);
    setOwnerBalance(formatEther(await provider.getBalance(accountChanged)));
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Welcome to the Multi-Signature Decentraziled App</h2>
        <p>Connected owner address:</p>
        <p>Contract balance: </p>
        <button>Fund the contract</button>
        <p>Beneficiary address: </p>
        <input
          type="text"
          placeholder="Enter your beneficiary address."
          onChange={(e) => setBeneficiary(e.target.value)}
        />
        <span>----------------------------</span>
        <p>Enter the amount in ETH</p>
        <input
          type="text"
          placeholder="Enter the amount to transfer to the beneficiary."
          onChange={(e) => setAmountToSend(e.target.value)}
        ></input>
      </header>
    </div>
  );
}

export default App;
