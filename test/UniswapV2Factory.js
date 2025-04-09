const {chai, expect } = require("chai");
const { expandTo18Decimals } = require('./shared/utilities');
const hre = require("hardhat");
const { 
  BigInt,
  getBigInt,
  getAddress,
  keccak256,
  AbiCoder,
  toUtf8Bytes,
  getCreate2Address
} = require('ethers')


const TEST_ADDRESSES = [
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000'
];

const TOTAL_SUPPLY = expandTo18Decimals(10000)

describe('UniswapV2Factory', function () {

let token;
let wallet;
let other;
let factory;
 
  beforeEach(async function () {

    // NOTE: It's not necessary to deploy the pair contract
    // while pallet-revive now require the code exists on chain
    // before it is deployed inside a contract.


    // [wallet, other] = await ethers.getSigners();
    const provider = new ethers.JsonRpcProvider(hre.network.config.url);
    const [walletKey, otherKey] = [hre.network.config.accounts[0], hre.network.config.accounts[1]];
    [wallet, other] = [new ethers.Wallet(walletKey, provider), new ethers.Wallet(otherKey, provider)];

    const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair", wallet);
    const ERC20 = await ethers.getContractFactory("ERC20", wallet);
    token = await ERC20.deploy(TOTAL_SUPPLY);
    await token.waitForDeployment();


    let pair = await UniswapV2Pair.deploy();
    await pair.waitForDeployment();

    const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory", wallet);
    factory = await UniswapV2Factory.deploy(wallet.address);
    await factory.waitForDeployment();

  });


  it('feeTo, feeToSetter, allPairsLength', async function() {
    expect(await factory.feeTo()).to.eq(ethers.ZeroAddress);
    expect(await factory.feeToSetter()).to.eq(wallet.address);
    expect(await factory.allPairsLength()).to.eq(0);
  });

//   async function createPair(tokens) {
//     const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
//     let pair = await UniswapV2Pair.deploy({
//       allowUnlimitedInitCodeSize: true,
//     });
//     await pair.waitForDeployment();

//     // const bytecode = `0x${UniswapV2Pair.evm.bytecode.object}`;
//     const bytecode = UniswapV2Pair.bytecode;
//     const create2Address = getCreate2Address(factory.address, tokens, bytecode);
//     console.log("Predicted create2Address of Pair", create2Address);

//     await expect(factory.createPair(tokens[0], tokens[1]))
//       .to.emit(factory, 'PairCreated')
//       .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, 1n);
//     console.log("factory address", await factory.getAddress());
//     await factory.createPair(tokens[0], tokens[1]);
//     await expect(factory.createPair(...tokens)).to.be.reverted; // UniswapV2: PAIR_EXISTS
//     await expect(factory.createPair(...tokens.slice().reverse())).to.be.reverted; // UniswapV2: PAIR_EXISTS
//     expect(await factory.getPair(...tokens)).to.eq(create2Address);
//     expect(await factory.getPair(...tokens.slice().reverse())).to.eq(create2Address);
//     expect(await factory.allPairs(0)).to.eq(create2Address);
//     expect(await factory.allPairsLength()).to.eq(1);

//     // const pair = new Contract(create2Address, JSON.stringify(UniswapV2Pair.abi), provider);
//     // expect(await pair.factory()).to.eq(factory.address);
//     // expect(await pair.token0()).to.eq(TEST_ADDRESSES[0]);
//     // expect(await pair.token1()).to.eq(TEST_ADDRESSES[1]);
//   }

//   it('createPair', async function() {
//     await createPair(TEST_ADDRESSES);
//   });

//   // it('createPair:reverse', async function() {
//   //   await createPair(TEST_ADDRESSES.slice().reverse());
//   // });

//   // it('createPair:gas', async function() {
//   //   const tx = await factory.createPair(...TEST_ADDRESSES);
//   //   const receipt = await tx.wait();
//   //   expect(receipt.gasUsed).to.eq(2512920);
//   // });

//   it('setFeeTo', async function() {
//     await expect(factory.connect(other).setFeeTo(other.address))
//       .to.be.revertedWith('UniswapV2: FORBIDDEN');
//     await factory.setFeeTo(wallet.address);
//     expect(await factory.feeTo()).to.eq(wallet.address);
//   });

//   it('setFeeToSetter', async function() {
//     await expect(factory.connect(other).setFeeToSetter(other.address))
//       .to.be.revertedWith('UniswapV2: FORBIDDEN');
//     await factory.setFeeToSetter(other.address);
//     expect(await factory.feeToSetter()).to.eq(other.address);
//     await expect(factory.setFeeToSetter(wallet.address))
//       .to.be.revertedWith('UniswapV2: FORBIDDEN');
//   });
});
