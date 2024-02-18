import { useState, useEffect } from "react";
import "./App.css";
import ABI from "./contracts/MultiSig.json";
import { ethers, formatEther, getAddress } from "ethers";

const multisigAddress = "0xd999e344eee20D04Aff6873E3376Dfb3dfCd5c39";

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
  const [beneBalance, setBeneBalance] = useState();
  const [amountToBene, setAmountToBene] = useState();
  const [userInfo, setUserInfo] = useState("");
  const [trxId, setTrxId] = useState("");
  const [confirmationsLeft, setConfirmationsLeft] = useState(2);

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
        updateBalances();
        const multiSigContract = await instantiateContract();
        if (multiSigContract) {
          multiSigContract.on("Transfer", () => {
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

  const instantiateContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const multiSigContract = new ethers.Contract(
      multisigAddress,
      ABI.abi,
      signer
    );
    return multiSigContract;
  };

  const updateBalances = async () => {
    if (owner) {
      setOwnerBalance(
        ethers.formatUnits(
          await window.ethereum.request({
            method: "eth_getBalance",
            params: [owner, "latest"],
          }),
          "ether"
        )
      );
    }
    setContractBalance(
      ethers.formatEther(
        await window.ethereum.request({
          method: "eth_getBalance",
          params: [multisigAddress, "latest"],
        })
      )
    );
    if (beneficiary) {
      try {
        setBeneBalance(
          ethers.formatEther(
            await window.ethereum.request({
              method: "eth_getBalance",
              params: [ethers.getAddress(beneficiary), "latest"],
            })
          )
        );
      } catch (error) {
        console.log("invalid bene: ", error.message);
      }
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
      } catch (error) {
        // alert(`Error: ` + `${error.message}`);
        throw new Error(error.message);
      }
    }
  };

  const transferToBeneButton = () => {
    return (
      <button
        // style={{ visibility: amountToBene ? "visible" : "hidden" }}
        className="button"
        onClick={submitToConfirm}
      >
        Submit!
      </button>
    );
  };

  const submitToConfirm = async () => {
    if (owner && amountToBene) {
      let transferInWei = ethers.parseEther(amountToBene);
      try {
        const multiSigContract = await instantiateContract();
        console.log("contract: ", multiSigContract);
        // this will confirm once
        const trxId = await multiSigContract.submitTransaction(
          beneficiary,
          ethers.toQuantity(transferInWei)
        );
        setTrxId(trxId);
        await confirmationsCountByTrxId();
        console.log("trxId in submit: ", trxId);
      } catch (error) {
        alert(`Error: ` + `${error.message}`);
      }
    }
  };

  const confirmToBeneButton = () => {
    return (
      <button
        // style={{ visibility: amountToBene ? "visible" : "hidden" }}
        className="button"
        onClick={confirmByTrxId}
      >
        Confirm to transfer!
      </button>
    );
  };

  const confirmByTrxId = async () => {
    try {
      const multiSigContract = await instantiateContract();
      console.log("contract in confirm: ", trxId, " ....  ", multiSigContract);
      const trxIdConfirm = await multiSigContract.confirmTransaction(trxId);
      confirmationsCountByTrxId(trxIdConfirm);
      setTrxId(trxIdConfirm);
    } catch (error) {
      alert(`Error: ` + `${error.message}`);
    }
  };

  const confirmationsCountByTrxId = async (trxId) => {
    const multiSigContract = await instantiateContract();
    const getConfirmationsCount = await multiSigContract.getConfirmationsCount(
      trxId
    );
    setConfirmationsLeft(getConfirmationsCount);
  };

  useEffect(() => {
    checkCurrentAccount();
    checkWalletIsConnected();
  }, [owner, ownerBalance, contractBalance, beneBalance, beneficiary]);

  return (
    <div className="App">
      <header className="App-header">
        <h3>Welcome to the Multi-Signature Decentraziled App</h3>
        <div>{connectWalletButton()}</div>
        <div className="owner">
          <label>Connected owner's address: {owner}</label>
          <label>
            Connected owner's balance:{" "}
            {ownerBalance ? ownerBalance + ` ETH` : ""}
          </label>
        </div>
        <div className="contract">
          <label>Contract address: {multisigAddress}</label>
          <label>
            Contract balance: {contractBalance ? contractBalance + ` ETH` : ""}
          </label>
          <input
            type="number"
            placeholder="Deposit in ETH to the contract...."
            onChange={(e) => setFundTheContract(e.target.value)}
          ></input>
          <div>{fundTheContractButton()}</div>
        </div>
        <div className="beneficiary">
          <input
            type="text"
            placeholder="Enter your beneficiary address."
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <label>Beneficiary address: {beneficiary}</label>
          <label>
            Beneficiary balance: {beneBalance ? beneBalance + ` ETH` : ""}{" "}
          </label>
          <input
            type="number"
            placeholder="Transfer in ETH to the beneficiary."
            onChange={(e) => setAmountToBene(e.target.value)}
          ></input>
          <div>{transferToBeneButton()}</div>
          <div>{confirmToBeneButton()}</div>
          <p style={{ fontSize: 20 }}>
            Required confirmation(s) to transfer : {confirmationsLeft}
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
