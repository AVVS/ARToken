// const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const Ganache = require('ganache-core');

module.exports = {
  networks: {
    test: {
      provider() {
        //  ./node_modules/.bin/ganache-cli --host 127.0.0.1 -l 115000000 -d -i 1337
        // const provider = new HDWalletProvider(mnemonic, 'http://localhost:8545/');
        const mnemonic = 'myth like bonus scare over problem client lizard pioneer submit female collect';

        return Ganache.provider({
          seed: mnemonic,
          total_accounts: 10,
          network_id: 1337,
          locked: false,
        });
      },
      network_id: '*',
    },
    ropsten: {
      from: '0x006EB704aB30Fd9FEe1db6561856D75D5db8fA4e',
      host: 'localhost',
      port: 8547,
      network_id: 3,
      gas: 4500000,
      gasPrice: 1000000000, // 1 gwei
    },
    live: {
      from: '0x005c1E464F8d4422e08B0620C7ADcdcBbe0FB240',
      network_id: 1,
      host: 'localhost',
      port: 8548,
      gas: 4500000,
      gasPrice: 1000010002,
    },
  },
  solc: {
    optimizer: {
      enabled: process.env.NODE_ENV === 'production',
      runs: 200
    }
  }
};
