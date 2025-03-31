# hardhat-revive-uniswap-v2-core
## Prerequisites
Ensure that you have substrate-node, eth-rpc and local resolc binaries on your local machine. If not, follow these instructions to install them:

```bash
git clone https://github.com/paritytech/polkadot-sdk
cd polkadot-sdk
cargo build --bin substrate-node --release
cargo build -p pallet-revive-eth-rpc --release
```
Once the build is complete, you will find both binaries in the `./target/release` directory.

For resolc's installation, please refer to the [resolc's README](https://github.com/paritytech/revive/blob/main/README.md).
Start the network by running:

```bash
./target/release/substrate-node --dev
./target/release/eth-rpc --dev
```

## How to Initialize
```bash
git clone https://github.com/sekisamu/hardhat-revive-storage
npm install
```
Open the `hardhat.config.js` file and update the following fields under networks -> hardhat:
```
nodeBinaryPath: Set this to the local path of your substrate-node binary.

adapterBinaryPath: Set this to the local path of your eth-rpc binary.

```
And add the following fields under resolc -> settings:
```
compilerPath: Set this to the local path of your resolc binary.
```

Ensure that both paths correctly point to the respective executable files.

How to Test
```bash
# For PolkaVM chains
USE_RESOLC=true npx hardhat test --network polkavm

# For EVM chains
npx hardhat test --network sepolia
```
Note: You need to restart the network and rpc endpoint after each test (For PolkaVM chains).
