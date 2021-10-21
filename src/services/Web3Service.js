class Web3Service {
  web3Instance;

  constructor() {
    window.web3Instance = this.web3Instance;
  }

  async connectMetamaskWallet() {
    if (window.ethereum) {
      const accountsAddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accountAddress = accountsAddress[0];

      return accountAddress;
    }
  }

  async addPolygonMumbaiRPC() {
    if (window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ 
          chainId: '0x13881', // A 0x-prefixed hexadecimal string (80001 for Mumbai)
          chainName: 'Matic (Polygon) Testnet Mumbai',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'tMATIC', // 2-6 characters long
            decimals: 18,
          },
          rpcUrls: ['https://rpc-mumbai.matic.today'],
          blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
        }],
      })
    }
  }
}

const instance = new Web3Service();
Object.freeze(instance);

export default instance;