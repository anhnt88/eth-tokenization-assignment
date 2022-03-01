import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded:false, 
    kycAddress: "0x123...", 
    tokenSaleAddress: null, 
    userTokens:0, 
    availableTokens: 0, 
    totalSupply: 0,
    tokenName: "",
    tokenSymbol: ""
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
    
      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );
      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState({loaded:true, tokenSaleAddress:MyTokenSale.networks[this.networkId].address}, this.updateUserTokens);
      this.updateAvailableTokens();
      this.updateTotalSupply();
      this.updateInfo();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateInfo = async () => {
    let tokenSymbol = await this.tokenInstance.methods.symbol().call();
    this.setState({tokenSymbol: tokenSymbol});
    let tokenName = await this.tokenInstance.methods.name().call();
    this.setState({tokenName: tokenName});
  }

  updateTotalSupply = async () => {
    let totalSupply = await this.tokenInstance.methods.totalSupply().call();
    this.setState({totalSupply: totalSupply});
    console.log("Update total supply. total_tokens=" + totalSupply);
  }

  updateAvailableTokens = async () => {
    let availableTokens = await this.tokenInstance.methods.balanceOf(MyTokenSale.networks[this.networkId].address).call();
    this.setState({availableTokens: availableTokens});
    console.log("Update available tokens:" + availableTokens);
  }

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens: userTokens});
    console.log("update user tokens, user:" + this.accounts[0] + ", userTokens:" + userTokens);
  }

  listenToTokenTransfer = () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateUserTokens);
    this.tokenInstance.events.Transfer({from: MyTokenSale.networks[this.networkId].address}).on("data",this.updateAvailableTokens);
    this.tokenInstance.events.Transfer({from: MyTokenSale.networks[this.networkId].address}).on("data",this.updateTotalSupply);
  }

  handleBuyTokens = async() => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei("1","wei")});
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleKycWhitelisting = async () => {
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
    alert("KYC for "+this.state.kycAddress+" is completed");
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>{this.state.tokenName} Token Sale</h1>
        <p>Get your Tokens today!</p>
        <p>Address: {MyToken.networks[this.networkId].address}</p>
        <p>Total Supply: {this.state.totalSupply}</p>
        <p>Total available token: {this.state.availableTokens}</p>
        <h2>Kyc Whitelisting</h2>
        Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleKycWhitelisting}>Add to Whitelist</button>
        <h2>Buy Tokens</h2>
        <p>If you want to buy tokens, send Wei to this address: {this.state.tokenSaleAddress}</p>
        <p>You currently have: {this.state.userTokens} {this.state.tokenSymbol} Tokens</p>
        <button type="button" onClick={this.handleBuyTokens}>Buy more tokens</button>
      </div>
    );
  }
}

export default App;
