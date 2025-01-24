require("@nomicfoundation/hardhat-toolbox");
require("hardhat-resolc");
// require("./tasks/deploy-revive");
// require("./tasks/compile-revive");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: { polkavm: true },
    // polkavm: { url: "http://127.0.0.1:8545" },
    polkavm: { 
        url: "https://westend-asset-hub-eth-rpc.polkadot.io",
        accounts: ['my_private_key'],
     },
  },
  resolc: {
    version: "1.5.2",
    compilerSource: "remix",
    settings: {
      optimizer: {
        enabled: false,
        runs: 600,
      },
      evmVersion: "istanbul",
    },
  },
};
