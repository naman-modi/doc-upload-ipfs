import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import ipfs from "./ipfs";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ipfsHash: "",
      storageValue: 0,
      web3: null,
      accounts: null,
      contract: null,
      account: null,
    };

    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  //state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(this.state.accounts);

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
      console.log(this.state.accounts);
      //console.log(this.status.contract);
      //  this.setState()
      this.setState({ account: accounts[0] });
      console.log("account", accounts[0]);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { contract } = this.state;

    // Stores a given value, 5 by default.
    //await contract.methods.set(this.state.ipfsHash).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ ipfsHash: response });

    console.log("response", this.state.storageValue);
  };

  captureFile(event) {
    console.log("CAPtured file...");
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      //console.log("buffer", this.state.buffer);
    };
  }

  onSubmit(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    ipfs.files.add(this.state.buffer, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      this.setState({ ipfsHash: result[0].hash });
      console.log("ipfs", this.state.ipfsHash);
      console.log("hash is generated....");

      contract.methods.set(result[0].hash).send({ from: accounts[0] });
      this.setState({ ipfsHash: "" });
      console.log("ipfs", this.state.ipfsHash);
    });
    console.log("Submitted file...");
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>IPFS File Upload DApp</h1>
        <h2>Your Document</h2>
        <p>This document is stored on IPFS & The etherum blockchain</p>
        <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""></img>
        <h2>Upload Document here</h2>
        <form onSubmit={this.onSubmit}>
          <input type="file" onChange={this.captureFile}></input> {/* */}
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}

export default App;
