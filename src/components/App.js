import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./App.css";
import Web3 from "web3";

function App() {
  const [account, setAccount] = useState("0x0");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [daiToken, setDaiToken] = useState({});
  const [dappToken, setDappToken] = useState({});
  const [tokenFarm, setTokenFarm] = useState({});
  const [daiTokenBalance, setDaiTokenBalance] = useState("0");
  const [dappTokenBalance, setDappTokenBalance] = useState("0");
  const [stakingBalance, setStakingBalance] = useState("0");

  useEffect(() => {
    // Fetch the accounts in metamask/web3 wallet
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accs = await window.web3.eth.getAccounts();
        if (accs) {
          setAccounts((accounts) => [...accounts, accs]);
        }
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert("Browser doesn't support Web3");
      }
    };
    loadWeb3();
  }, []);

  useEffect(() => {
    // Once the account is loaded, we can fetch the rest of the data
    const loadBlockchainData = async () => {
      setAccount(accounts[0]);

    };
    loadBlockchainData();
  }, [accounts]);

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: "600px" }}>
            <div className="content mr-auto ml-auto">
              <a href="" target="_blank" rel="noopener noreferrer"></a>

              <h1>Hello, World!</h1>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
