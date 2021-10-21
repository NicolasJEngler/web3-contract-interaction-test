import { useState, useEffect } from 'react';
import './App.css';
import Web3 from 'web3';
import Web3Service from './services/Web3Service';

// This was taken from Etherscan https://rinkeby.etherscan.io/address/0x2Aa0724852CdCbe74B7737075885d538896a1FaF
import contractABI from './ABI.json'

function App() {
  const web3 = new Web3(Web3.givenProvider); // If you're not using something like Metamask (which injects a provider in the window object), point to a Web3 provider like Infura

  // Check https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html
  // Here we set up a contract interface to interact with, requires an ABI and a contract address
  const contract = new web3.eth.Contract(contractABI, '0x2Aa0724852CdCbe74B7737075885d538896a1FaF');

  // Fire up Metamask modal to connect a wallet
  // Check Web3Service.js to look into the function that adds this functionality
  // A library like Onboard.js takes care of all of this
  const connectWallet = () => {
    Web3Service.connectMetamaskWallet()
      .then((address) => {
        setWalletAddress(address);
      });
  }

  const [walletAddress, setWalletAddress] = useState(null),
        [currentChain, setCurrentChain] = useState(null);

  // We create a mint function on our front-end 
  // (different from the mint function available in the contract interface)
  // Accepts a minterAddress, a tokenURI (could be an IPFS hash), and a *string* value for the NFT in ether
  const mint = (minterAddress, tokenURI, nftValue) => {
    contract.methods.mint(minterAddress, tokenURI)
      .send({
        from: walletAddress, 
        value: web3.utils.toWei(nftValue, 'ether')
      });
  };

  const detectChain = () => {
    web3.eth.net.getId().then((chain) => {
      setCurrentChain(chain);
    });
  }

  const addPolygonMumbai = () => {
    Web3Service.addPolygonMumbaiRPC()
      .then((error) => {
        detectChain();
      });
  };

  useEffect(() => {
    detectChain();
  }, []);

  return (
    <div className="App">
      <h4>You're currently on chain ID: {currentChain}</h4>

      <p><button onClick={detectChain}>Detect chain again!</button></p>

      <ul style={{maxWidth: 320, margin: 'auto', textAlign: 'left'}}>
        <li>Ethereum Mainnet - 1</li>
        <li>Ethereum Testnet Rinkeby - 4</li>
        <li>Polygon Matic Mainnet - 137</li>
        <li>Polygon Matic Testnet Mumbai - 80001</li>
      </ul>

      <p><button onClick={addPolygonMumbai}>Add RPC for Polygon Testnet (Mumbai)</button></p>

      <hr />


      {
        walletAddress ? 
          <h4>Connected wallet address: {walletAddress}</h4> :
          <h4>Please, connect your wallet</h4>
      }

      {
        !walletAddress ?
          <button onClick={connectWallet}>Connect wallet!</button> : 
          null
      }

      {
        // This call to the front-end mint function passes the current wallet address connected,
        // a hardcoded tokenURI of 3, but should be if possible an IPFS hash
        // and a value in ether as a string
        walletAddress ? 
          <button onClick={() => {mint(walletAddress, 3, '0.1')}}>Mint!</button> :
          null
      }
    </div>
  );
}

export default App;
