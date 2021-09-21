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
}

const instance = new Web3Service();
Object.freeze(instance);

export default instance;