const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  networks: {
    development: {
      provider: () => new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50),
      network_id: '*',
      gas: 9999999
    }
  },

  compilers: {
    solc: {
      version: "0.6.6",    // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    }
  }
};