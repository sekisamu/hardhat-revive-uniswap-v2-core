require("@nomicfoundation/hardhat-toolbox");
require("hardhat-resolc");
// require("./tasks/deploy-revive");
// require("./tasks/compile-revive");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  //   networks: {
  // testnet: {
  //   url: "https://westend-asset-hub-eth-rpc.polkadot.io",
  //   chainId: 420420421,
  //   accounts: ['3e7ea1d4592806bea5692b0a6a03a717486ffa971c2be78502425aef990ecf4e'],
  //   gasPrice: 20000000000,
  //   timeout: 200000,
  // },
  // anvil: {
  //    url:  "http://127.0.0.1:8545",
  //     accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
  //     chainId: 31337,
  // },
  //   }
  //   networks: {
  //     hardhat: { polkavm: true },
  //       polkavm: {
  //         url: "http://127.0.0.1:8545"
  //       },
  //     },
  //   },

  networks: {
    hardhat: { polkavm: true },
    polkavm: { url: "http://127.0.0.1:8545" },
  },
  resolc: {
    version: "1.5.2",
    compilerSource: "remix",
    settings: {
      optimizer: {
        enabled: false,
      },
      evmVersion: "istanbul",
    },
  },
};
