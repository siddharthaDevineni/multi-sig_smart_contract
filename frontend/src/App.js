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
  const [currentAccount, setCurrentAccount] = useState();
  const [fundTheContract, setFundTheContract] = useState();
  const [beneficiary, setBeneficiary] = useState();
  const [amountToSend, setAmountToSend] = useState();
  const [userInfo, setUserInfo] = useState();
  const [contractBalance, setContractBalance] = useState();

  const checkCurrentAccount = async () => {
    const acc = await window.ethereum.request({
      method: "eth_accounts",
    });
    setCurrentAccount(acc[0]);
    console.log("currentAccount: ", acc[0]);
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
      } catch (error) {}
    } else {
      alert(
        `You must install Metamask extension, a virtual Ethereum wallet from ${`https://metamask.io/download.html`}`
      );
    }
  };

  // const accountChangeHandler = async (accountChanged) => {
  //   console.log("owner: ", accountChanged);
  //   setOwner(accountChanged);
  //   setOwnerBalance(formatEther(await provider.getBalance(accountChanged)));
  //   console.log("balance: ", ownerBalance);
  // };

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
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
      } catch (error) {}
    } else {
      alert(
        `Please install Metamask extension, a virtual Ethereum wallet from ${`https://metamask.io/download.html`}`
      );
    }
  }

  const connectWalletButton = () => {
    return (
      <button className="button" onClick={connectWallet}>
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

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Welcome to the Multi-Signature Decentraziled App</h2>
        <div>{connectWalletButton()}</div>
        <div className="owner">
          <label>Connected owner's address: {owner}</label>
          <label>
            Connected owner's balance: {ownerBalance}
            <span style={{ color: "gray" }}>ETH</span>
          </label>
        </div>
        <div className="contract">
          <label>Contract balance: </label>
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
