require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");

require("dotenv").config();
// require("hardhat-revive-node");
/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: '../../../code/polkadot-sdk/target/debug/substrate-node',
        rpcPort: 8000,
        dev: true,
      },
      adapterConfig: {
        adapterBinaryPath: '../../../code/polkadot-sdk/target/debug/eth-rpc',
        dev: true,
      },
    },
    polkavm: {
      polkavm: true,   
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.LOCAL_PRIV_KEY, process.env.AH_PRIV_KEY],
    },

    ah: { 
      polkavm: true,
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      accounts: [process.env.AH_PRIV_KEY, process.env.LOCAL_PRIV_KEY],
    },

    sepolia: {
      polkavm: false,
      url: "https://eth-sepolia.api.onfinality.io/public",
      accounts: [process.env.AH_PRIV_KEY, process.env.LOCAL_PRIV_KEY],
    },

    moonbeam: {
      polkavm: false,
      url: "https://moonbeam.api.onfinality.io/public",
      accounts: [process.env.AH_PRIV_KEY, process.env.LOCAL_PRIV_KEY],
    },
  },
};

const cliNetwork = process.argv.indexOf('--network') !== -1 
  ? process.argv[process.argv.indexOf('--network') + 1]
  : null;

const needsResolc = config.networks[cliNetwork]?.polkavm === true;

console.log("Current network:", cliNetwork);
console.log("needsResolc:", needsResolc);

if (needsResolc) {
  require("hardhat-resolc");
  require("hardhat-revive-node");
  // Standard JSON output
  config.resolc = {
    compilerSource: 'binary',
    settings: {
      optimizer: {
        enabled: true,
      },
      evmVersion: 'istanbul',
      compilerPath: '~/.cargo/bin/resolc-0.1.0-dev.14',
      standardJson: true,
    },
  };
}

module.exports = config;
