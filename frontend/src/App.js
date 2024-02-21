import { useState, useEffect } from "react";
import "./App.css";
import ABI from "./contracts/MultiSig.json";
import { ethers } from "ethers";

const multisigAddress = "0x3f19D2CCB0ab01e7418CAf037Ce359A0d753ccaA";

function App() {
  const [owner, setOwner] = useState("");
  const [ownerBalance, setOwnerBalance] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const [fundTheContract, setFundTheContract] = useState("");
  const [beneficiary, setBeneficiary] = useState();
  const [beneBalance, setBeneBalance] = useState();
  const [amountToBene, setAmountToBene] = useState();
  const [currentTrxId, setCurrentTrxId] = useState(0);
  const [confirmationsLeft, setConfirmationsLeft] = useState(2);

  let ownerAddr;
  const checkCurrentAccount = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        console.log("account changed: ");
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
      } catch (error) {
        alert(`Error: ` + `${error.message}`);
        setOwner("");
        updateBalances();
      }
    } else {
      let link = "https://metamask.io/download.html";
      alert(
        `Please install and connect to Metamask extension, a virtual Ethereum wallet from ` +
          `${link}`
      );
      setOwner("");
      updateBalances();
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setOwner(accounts[0]);
        updateBalances();
      } catch (err) {
        alert(`Error: ` + `${err.message}`);
        setOwner("");
        updateBalances();
      }
    } else {
      setOwner("");
      updateBalances();
      let link = "https://metamask.io/download.html";
      alert(
        `Please install and connect to Metamask extension, a virtual Ethereum wallet from ` +
          `${link}`
      );
    }
  };

  const instantiateContract = async () => {
    if (owner) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const multiSigContract = new ethers.Contract(
        multisigAddress,
        ABI.abi,
        signer
      );
      return multiSigContract;
    }
  };

  const contractEventListener = async () => {
    const multiSigContract = await instantiateContract();
    if (multiSigContract) {
      multiSigContract.on("Transfer", () => {
        updateBalances();
      });
    }
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
        alert(`Error: ` + `${error.message}`);
      }
    }
  };

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

  const fundTheContractButton = () => {
    return (
      <button className="button" onClick={sendFundsToTheContract}>
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
        alert(`Error: ` + `${error.message}`);
      }
    }
  };

  const transferToBeneButton = () => {
    return (
      <button className="button" onClick={submitToConfirm}>
        Submit!
      </button>
    );
  };

  const submitToConfirm = async () => {
    if (owner && amountToBene && beneficiary) {
      let transferInWei = ethers.parseEther(amountToBene);
      try {
        const multiSigContract = await instantiateContract();
        const trxCount = await multiSigContract.transactionCount();
        setCurrentTrxId(trxCount);

        // this will confirm once
        await multiSigContract.submitTransaction(
          beneficiary,
          ethers.toQuantity(transferInWei)
        );
        setTimeout(() => {
          confirmationsCountByTrxId();
        }, 15000);
      } catch (error) {
        alert(`Error: ` + `${error.message}`);
      }
    } else {
      alert(`Please enter Beneficiary details`);
    }
  };

  const confirmToBeneButton = () => {
    return (
      <button className="button" onClick={confirmByTrxId}>
        Confirm to transfer!
      </button>
    );
  };

  const confirmByTrxId = async () => {
    try {
      const multiSigContract = await instantiateContract();
      await multiSigContract.confirmTransaction(currentTrxId);
      setTimeout(() => {
        confirmationsCountByTrxId();
      }, 15000);
    } catch (error) {
      alert(`Error: ` + `${error.message}`);
    }
  };

  const confirmationsCountByTrxId = async () => {
    const multiSigContract = await instantiateContract();
    const getCount = await multiSigContract.getConfirmationsCount(currentTrxId);
    setConfirmationsLeft(getCount);
  };

  useEffect(() => {
    checkCurrentAccount();
    contractEventListener();
    checkWalletIsConnected();
  }, [owner, ownerBalance, contractBalance, beneBalance, beneficiary]);

  return (
    <div className="App">
      <header className="App-header">
        <h3>Welcome to the Multi-Signature Decentralised App</h3>
        <div>{connectWalletButton()}</div>
        <div className="owner">
          <label>Connected owner's address: {owner}</label>
          <label>
            Connected owner's balance:{" "}
            {ownerBalance ? " " + ownerBalance + ` ETH` : ""}
          </label>
        </div>
        <div className="contract">
          <label>Contract address: {multisigAddress}</label>
          <label>
            Contract balance: {contractBalance ? contractBalance + ` ETH` : ""}
          </label>
          <input
            style={{ width: 250, height: 20 }}
            type="number"
            placeholder="Deposit in ETH to the contract...."
            onChange={(e) => setFundTheContract(e.target.value)}
          ></input>
          <div>{fundTheContractButton()}</div>
        </div>
        <div className="beneficiary">
          <input
            style={{ width: 750, height: 20 }}
            type="text"
            placeholder="Type here your beneficiary address to transfer the amount to...."
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <label>Beneficiary address: {beneficiary}</label>
          <label>
            Beneficiary balance: {beneBalance ? beneBalance + ` ETH` : ""}
          </label>
          <input
            style={{ width: 250, height: 20 }}
            type="number"
            placeholder="Amount in ETH to the beneficiary...."
            onChange={(e) => setAmountToBene(e.target.value)}
          ></input>
          <div>{transferToBeneButton()}</div>
          <div>{confirmToBeneButton()}</div>
          <p style={{ fontSize: 20 }}>
            Required confirmation(s) to transfer:
            {confirmationsLeft ? " " + confirmationsLeft : " "}
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
