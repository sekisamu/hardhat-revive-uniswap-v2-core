const {chai, expect } = require("chai");
const { expandTo18Decimals } = require('./shared/utilities');
const hre = require("hardhat");
const { 
  BigInt,
  getBigInt,
  getAddress,
  keccak256,
  AbiCoder,
  toUtf8Bytes
} = require('ethers')

const { getCreate2Address } = require('./shared/utilities');


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
    const ERC20 = await ethers.getContractFactory("ERC20");

    // token = await ERC20.deploy(TOTAL_SUPPLY);
    // await token.waitForDeployment();
    [wallet, other] = await ethers.getSigners();

    const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await UniswapV2Factory.deploy(wallet.address);
    await factory.waitForDeployment();
  });


  it('feeTo, feeToSetter, allPairsLength', async function() {
    expect(await factory.feeTo()).to.eq(ethers.ZeroAddress);
    expect(await factory.feeToSetter()).to.eq(wallet.address);
    expect(await factory.allPairsLength()).to.eq(0);
  });

  async function createPair(tokens) {
    const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
    // let pair = await UniswapV2Pair.deploy({
    //   allowUnlimitedInitCodeSize: true,
    //   common: {
    //     allowUnlimitedInitCodeSize: true,
    //   },
    // });
    // await pair.waitForDeployment();

    // const bytecode = `0x${UniswapV2Pair.evm.bytecode.object}`;
    const bytecode = UniswapV2Pair.bytecode;
    const create2Address = getCreate2Address(factory.address, tokens, bytecode);

    // await expect(factory.createPair(tokens[0], tokens[1]))
      // .to.emit(factory, 'PairCreated')
      // .withArgs(TEST_ADDRESSES[0], TEST_ADDRESSES[1], create2Address, 1n);
    console.log("factory address", await factory.getAddress());
    await factory.createPair(tokens[0], tokens[1]);
    // await expect(factory.createPair(...tokens)).to.be.reverted; // UniswapV2: PAIR_EXISTS
    // await expect(factory.createPair(...tokens.slice().reverse())).to.be.reverted; // UniswapV2: PAIR_EXISTS
    // expect(await factory.getPair(...tokens)).to.eq(create2Address);
    // expect(await factory.getPair(...tokens.slice().reverse())).to.eq(create2Address);
    // expect(await factory.allPairs(0)).to.eq(create2Address);
    // expect(await factory.allPairsLength()).to.eq(1);

    // const pair = new Contract(create2Address, JSON.stringify(UniswapV2Pair.abi), provider);
    // expect(await pair.factory()).to.eq(factory.address);
    // expect(await pair.token0()).to.eq(TEST_ADDRESSES[0]);
    // expect(await pair.token1()).to.eq(TEST_ADDRESSES[1]);
  }

  it('createPair', async function() {
    await createPair(TEST_ADDRESSES);
  });

  // it('createPair:reverse', async function() {
  //   await createPair(TEST_ADDRESSES.slice().reverse());
  // });

  // it('createPair:gas', async function() {
  //   const tx = await factory.createPair(...TEST_ADDRESSES);
  //   const receipt = await tx.wait();
  //   expect(receipt.gasUsed).to.eq(2512920);
  // });

  it('setFeeTo', async function() {
    await expect(factory.connect(other).setFeeTo(other.address))
      .to.be.revertedWith('UniswapV2: FORBIDDEN');
    await factory.setFeeTo(wallet.address);
    expect(await factory.feeTo()).to.eq(wallet.address);
  });

  it('setFeeToSetter', async function() {
    await expect(factory.connect(other).setFeeToSetter(other.address))
      .to.be.revertedWith('UniswapV2: FORBIDDEN');
    await factory.setFeeToSetter(other.address);
    expect(await factory.feeToSetter()).to.eq(other.address);
    await expect(factory.setFeeToSetter(wallet.address))
      .to.be.revertedWith('UniswapV2: FORBIDDEN');
  });
});
