import { useState } from 'react';
import './App.css';
import Web3 from 'web3';
import Web3Service from './services/Web3Service';

// This was taken from Etherscan https://rinkeby.etherscan.io/address/0x2Aa0724852CdCbe74B7737075885d538896a1FaF
import mintingContractABI from './ABIs/Minting.json';

// This was taken from Etherscan https://rinkeby.etherscan.io/address/0xEC17ce447fD60Eab2ec6cB8C1438f607a3E06935
import marketplaceContractABI from './ABIs/Marketplace.json';

function App() {
  const web3 = new Web3(Web3.givenProvider); // If you're not using something like Metamask (which injects a provider in the window object), point to a Web3 provider like Infura

  // Check https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html
  // Here we set up a contract interface to interact with, requires an ABI and a contract address
  const mintingContract = new web3.eth.Contract(mintingContractABI, '0x2Aa0724852CdCbe74B7737075885d538896a1FaF');

  const marketplaceContract = new web3.eth.Contract(marketplaceContractABI, '0xEC17ce447fD60Eab2ec6cB8C1438f607a3E06935');

  // Fire up Metamask modal to connect a wallet
  // Check Web3Service.js to look into the function that adds this functionality
  // A library like Onboard.js takes care of all of this
  const connectWallet = () => {
    Web3Service.connectMetamaskWallet()
      .then((address) => {
        setWalletAddress(address);
      });
  }

  const [walletAddress, setWalletAddress] = useState(null);

  const [address, setAddress] = useState(null),
        [tokenId, setTokenId] = useState(null),
        [tokenUri, setTokenUri] = useState(null),
        [tokenPrice, setTokenPrice] = useState(0);

  // We create a mint function on our front-end 
  // (different from the mint function available in the contract interface)
  // Accepts a minterAddress, a tokenURI (could be an IPFS hash), and a *string* value for the NFT in ether
  const mint = (minterAddress, tokenURI) => {
    mintingContract.methods.mint(minterAddress, tokenURI)
      .send({
        from: walletAddress
      });
  };

  const setApprovalForAll = (operator, approved) => {
    mintingContract.methods.setApprovalForAll(operator, approved)
      .send({
        from: walletAddress
      });
  };

  const setApproval = (address, tokenId) => {
    mintingContract.methods.approve(address, tokenId)
      .send({
        from: walletAddress
      });
  };

  const listEnglishAuction = (nftContractAddress, nftTokenId, endDate, floorPrice) => {
    marketplaceContract.methods.createListing(nftContractAddress, nftTokenId, endDate, floorPrice)
      .send({
        from: walletAddress
      });
  };

  return (
    <div className="App">
      {
        walletAddress ? 
          <p>Connected wallet address: {walletAddress}</p> :
          <p>Please, connect your wallet</p>
      }

      {
        !walletAddress ?
          <button onClick={connectWallet}>Connect wallet!</button> : 
          null
      }

      {
        // Input to get addresses to interact with contract methods
        walletAddress ? 
          <input 
            type="text" 
            placeholder="Address to pass as parameter" 
            style={{ marginRight: 15 }} 
            onChange={(e) => {setAddress(e.target.value)}}
          /> :
          null
      }

      {
        // Input to get addresses to interact with contract methods
        walletAddress ? 
          <input 
            type="text" 
            placeholder="Token ID to pass as parameter" 
            style={{ marginRight: 15 }} 
            onChange={(e) => {setTokenId(e.target.value)}}
          /> :
          null
      }

      {
        // Input to get token URI to interact with contract methods
        walletAddress ? 
          <input 
            type="text" 
            placeholder="Token URI to pass as parameter" 
            style={{ marginRight: 15 }} 
            onChange={(e) => {setTokenUri(e.target.value)}}
          /> :
          null
      }

      {
        // Input to set token price to interact with contract methods
        walletAddress ? 
          <input 
            type="number" 
            defaultValue="0"
            placeholder="Token price to pass as parameter (ETH)" 
            onChange={(e) => {setTokenPrice(e.target.value)}}
          /> :
          null
      }

      <br />

      {
        // This call to the front-end mint function passes the current wallet address connected,
        // a hardcoded tokenURI of 3, but should be if possible an IPFS hash
        // and a value in ether as a string
        walletAddress ? 
          <button onClick={() => {mint(walletAddress, tokenUri)}}>Mint!</button> :
          null
      }

      <br />

      {
        // This approves transactions for all tokens of the minting contract
        // to be able to be sold in marketplace contracts. setApprovalForAll lives
        // in the minting contract.
        walletAddress ? 
          <button onClick={() => {setApprovalForAll(
            address, // Marketplace contract address
            true
          )}}>Approve tokens for transactions</button> :
          null
      }

      <br />

      {
        // This approves a particular token for transactions done by third-party
        // smart contracts, i.e.: listing for sale, transferring, etcetera
        walletAddress ? 
          <button onClick={() => {setApproval(
            address, // Marketplace contract address
            tokenId
          )}}>Approve single token for transaction</button> :
          null
      }

      <br />

      {
        // This call to the front-end marketplace listing function 
        // and passes token contract address and ID that wants to be sold
        // as well as end date for the auction and floor price in WEI
        walletAddress ? 
          <button onClick={() => {listEnglishAuction(
            address,
            tokenId,
            Math.floor(new Date().getTime() / 1000) + 3600, // 3600s = 1h. Auction ends in 1 hour.
            Web3.utils.toWei(String(tokenPrice), 'ether') // Floor price passed converted from Ether to Wei
          )}}>List as English auction!</button> :
          null
      }
    </div>
  );
}

export default App;
