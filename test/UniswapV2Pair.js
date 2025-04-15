const chai = require('chai');
const { expect } = chai;
const { Contract } = require('ethers');
const { constants, utils } = require('ethers');
const { solidity, MockProvider, createFixtureLoader } = require('ethereum-waffle');

const { expandTo18Decimals, mineBlock, encodePrice } = require('./shared/utilities');
const { pairFixture } = require('./shared/fixtures');

chai.use(solidity);

const MINIMUM_LIQUIDITY = utils.bigNumberify(10).pow(3);

const overrides = {
  gasLimit: 9999999
};

describe('UniswapV2Pair', function() {
  const provider = new MockProvider({
    hardfork: 'istanbul',
    mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
    gasLimit: 9999999
  });
  const [wallet, other] = provider.getWallets();
  const loadFixture = createFixtureLoader(provider, [wallet]);

  let factory;
  let token0;
  let token1;
  let pair;

  beforeEach(async function() {
    const fixture = await loadFixture(pairFixture);
    factory = fixture.factory;
    token0 = fixture.token0;
    token1 = fixture.token1;
    pair = fixture.pair;
  });

  it('mint', async function() {
    const token0Amount = expandTo18Decimals(1);
    const token1Amount = expandTo18Decimals(4);
    await token0.transfer(pair.address, token0Amount);
    await token1.transfer(pair.address, token1Amount);

    const expectedLiquidity = expandTo18Decimals(2);
    await expect(pair.mint(wallet.address, overrides))
      .to.emit(pair, 'Transfer')
      .withArgs(constants.AddressZero, constants.AddressZero, MINIMUM_LIQUIDITY)
      .to.emit(pair, 'Transfer')
      .withArgs(constants.AddressZero, wallet.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      .to.emit(pair, 'Sync')
      .withArgs(token0Amount, token1Amount)
      .to.emit(pair, 'Mint')
      .withArgs(wallet.address, token0Amount, token1Amount);

    expect(await pair.totalSupply()).to.eq(expectedLiquidity);
    expect(await pair.balanceOf(wallet.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY));
    expect(await token0.balanceOf(pair.address)).to.eq(token0Amount);
    expect(await token1.balanceOf(pair.address)).to.eq(token1Amount);
    const reserves = await pair.getReserves();
    expect(reserves[0]).to.eq(token0Amount);
    expect(reserves[1]).to.eq(token1Amount);
  });

  async function addLiquidity(token0Amount, token1Amount) {
    await token0.transfer(pair.address, token0Amount);
    await token1.transfer(pair.address, token1Amount);
    await pair.mint(wallet.address, overrides);
  }

  const swapTestCases = [
    [1, 5, 10, '1662497915624478906'],
    [1, 10, 5, '453305446940074565'],
    [2, 5, 10, '2851015155847869602'],
    [2, 10, 5, '831248957812239453'],
    [1, 10, 10, '906610893880149131'],
    [1, 100, 100, '987158034397061298'],
    [1, 1000, 1000, '996006981039903216']
  ].map(a => a.map(n => typeof n === 'string' ? utils.bigNumberify(n) : expandTo18Decimals(n)));

  swapTestCases.forEach((swapTestCase, i) => {
    it(`getInputPrice:${i}`, async function() {
      const [swapAmount, token0Amount, token1Amount, expectedOutputAmount] = swapTestCase;
      await addLiquidity(token0Amount, token1Amount);
      await token0.transfer(pair.address, swapAmount);
      await expect(pair.swap(0, expectedOutputAmount.add(1), wallet.address, '0x', overrides))
        .to.be.revertedWith('UniswapV2: K');
      await pair.swap(0, expectedOutputAmount, wallet.address, '0x', overrides);
    });
  });

  const optimisticTestCases = [
    ['997000000000000000', 5, 10, 1],
    ['997000000000000000', 10, 5, 1],
    ['997000000000000000', 5, 5, 1],
    [1, 5, 5, '1003009027081243732']
  ].map(a => a.map(n => typeof n === 'string' ? utils.bigNumberify(n) : expandTo18Decimals(n)));

  optimisticTestCases.forEach((optimisticTestCase, i) => {
    it(`optimistic:${i}`, async function() {
      const [outputAmount, token0Amount, token1Amount, inputAmount] = optimisticTestCase;
      await addLiquidity(token0Amount, token1Amount);
      await token0.transfer(pair.address, inputAmount);
      await expect(pair.swap(outputAmount.add(1), 0, wallet.address, '0x', overrides))
        .to.be.revertedWith('UniswapV2: K');
      await pair.swap(outputAmount, 0, wallet.address, '0x', overrides);
    });
  });

  it('swap:token0', async function() {
    const token0Amount = expandTo18Decimals(5);
    const token1Amount = expandTo18Decimals(10);
    await addLiquidity(token0Amount, token1Amount);

    const swapAmount = expandTo18Decimals(1);
    const expectedOutputAmount = utils.bigNumberify('1662497915624478906');
    await token0.transfer(pair.address, swapAmount);
    await expect(pair.swap(0, expectedOutputAmount, wallet.address, '0x', overrides))
      .to.emit(token1, 'Transfer')
      .withArgs(pair.address, wallet.address, expectedOutputAmount)
      .to.emit(pair, 'Sync')
      .withArgs(token0Amount.add(swapAmount), token1Amount.sub(expectedOutputAmount))
      .to.emit(pair, 'Swap')
      .withArgs(wallet.address, swapAmount, 0, 0, expectedOutputAmount, wallet.address);

    const reserves = await pair.getReserves();
    expect(reserves[0]).to.eq(token0Amount.add(swapAmount));
    expect(reserves[1]).to.eq(token1Amount.sub(expectedOutputAmount));
    expect(await token0.balanceOf(pair.address)).to.eq(token0Amount.add(swapAmount));
    expect(await token1.balanceOf(pair.address)).to.eq(token1Amount.sub(expectedOutputAmount));
    const totalSupplyToken0 = await token0.totalSupply();
    const totalSupplyToken1 = await token1.totalSupply();
    expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(token0Amount).sub(swapAmount));
    expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(token1Amount).add(expectedOutputAmount));
  });

  it('swap:token1', async function() {
    const token0Amount = expandTo18Decimals(5);
    const token1Amount = expandTo18Decimals(10);
    await addLiquidity(token0Amount, token1Amount);

    const swapAmount = expandTo18Decimals(1);
    const expectedOutputAmount = utils.bigNumberify('453305446940074565');
    await token1.transfer(pair.address, swapAmount);
    await expect(pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides))
      .to.emit(token0, 'Transfer')
      .withArgs(pair.address, wallet.address, expectedOutputAmount)
      .to.emit(pair, 'Sync')
      .withArgs(token0Amount.sub(expectedOutputAmount), token1Amount.add(swapAmount))
      .to.emit(pair, 'Swap')
      .withArgs(wallet.address, 0, swapAmount, expectedOutputAmount, 0, wallet.address);

    const reserves = await pair.getReserves();
    expect(reserves[0]).to.eq(token0Amount.sub(expectedOutputAmount));
    expect(reserves[1]).to.eq(token1Amount.add(swapAmount));
    expect(await token0.balanceOf(pair.address)).to.eq(token0Amount.sub(expectedOutputAmount));
    expect(await token1.balanceOf(pair.address)).to.eq(token1Amount.add(swapAmount));
    const totalSupplyToken0 = await token0.totalSupply();
    const totalSupplyToken1 = await token1.totalSupply();
    expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(token0Amount).add(expectedOutputAmount));
    expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(token1Amount).sub(swapAmount));
  });

  it('swap:gas', async function() {
    const token0Amount = expandTo18Decimals(5);
    const token1Amount = expandTo18Decimals(10);
    await addLiquidity(token0Amount, token1Amount);

    const block = await provider.getBlock('latest');
    await mineBlock(provider, block.timestamp + 1);
    await pair.sync(overrides);

    const swapAmount = expandTo18Decimals(1);
    const expectedOutputAmount = utils.bigNumberify('453305446940074565');
    await token1.transfer(pair.address, swapAmount);
    await mineBlock(provider, block.timestamp + 1);
    const tx = await pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides);
    const receipt = await tx.wait();
    expect(receipt.gasUsed).to.eq(73462);
  });

  it('burn', async function() {
    const token0Amount = expandTo18Decimals(3);
    const token1Amount = expandTo18Decimals(3);
    await addLiquidity(token0Amount, token1Amount);

    const expectedLiquidity = expandTo18Decimals(3);
    await pair.transfer(pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY));
    await expect(pair.burn(wallet.address, overrides))
      .to.emit(pair, 'Transfer')
      .withArgs(pair.address, constants.AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
      .to.emit(token0, 'Transfer')
      .withArgs(pair.address, wallet.address, token0Amount.sub(1000))
      .to.emit(token1, 'Transfer')
      .withArgs(pair.address, wallet.address, token1Amount.sub(1000))
      .to.emit(pair, 'Sync')
      .withArgs(1000, 1000)
      .to.emit(pair, 'Burn')
      .withArgs(wallet.address, token0Amount.sub(1000), token1Amount.sub(1000), wallet.address);

    expect(await pair.balanceOf(wallet.address)).to.eq(0);
    expect(await pair.totalSupply()).to.eq(MINIMUM_LIQUIDITY);
    expect(await token0.balanceOf(pair.address)).to.eq(1000);
    expect(await token1.balanceOf(pair.address)).to.eq(1000);
    const totalSupplyToken0 = await token0.totalSupply();
    const totalSupplyToken1 = await token1.totalSupply();
    expect(await token0.balanceOf(wallet.address)).to.eq(totalSupplyToken0.sub(1000));
    expect(await token1.balanceOf(wallet.address)).to.eq(totalSupplyToken1.sub(1000));
  });

  it('price{0,1}CumulativeLast', async function() {
    const token0Amount = expandTo18Decimals(3);
    const token1Amount = expandTo18Decimals(3);
    await addLiquidity(token0Amount, token1Amount);

    const reserves = await pair.getReserves();
    const blockTimestamp = reserves[2];
    await mineBlock(provider, blockTimestamp + 1);
    await pair.sync(overrides);

    const initialPrice = encodePrice(token0Amount, token1Amount);
    expect(await pair.price0CumulativeLast()).to.eq(initialPrice[0]);
    expect(await pair.price1CumulativeLast()).to.eq(initialPrice[1]);
    const updatedReserves = await pair.getReserves();
    expect(updatedReserves[2]).to.eq(blockTimestamp + 1);

    const swapAmount = expandTo18Decimals(3);
    await token0.transfer(pair.address, swapAmount);
    await mineBlock(provider, blockTimestamp + 10);
    await pair.swap(0, expandTo18Decimals(1), wallet.address, '0x', overrides);

    expect(await pair.price0CumulativeLast()).to.eq(initialPrice[0].mul(10));
    expect(await pair.price1CumulativeLast()).to.eq(initialPrice[1].mul(10));
    const latestReserves = await pair.getReserves();
    expect(latestReserves[2]).to.eq(blockTimestamp + 10);

    await mineBlock(provider, blockTimestamp + 20);
    await pair.sync(overrides);

    const newPrice = encodePrice(expandTo18Decimals(6), expandTo18Decimals(2));
    expect(await pair.price0CumulativeLast()).to.eq(initialPrice[0].mul(10).add(newPrice[0].mul(10)));
    expect(await pair.price1CumulativeLast()).to.eq(initialPrice[1].mul(10).add(newPrice[1].mul(10)));
    const finalReserves = await pair.getReserves();
    expect(finalReserves[2]).to.eq(blockTimestamp + 20);
  });

  it('feeTo:off', async function() {
    const token0Amount = expandTo18Decimals(1000);
    const token1Amount = expandTo18Decimals(1000);
    await addLiquidity(token0Amount, token1Amount);

    const swapAmount = expandTo18Decimals(1);
    const expectedOutputAmount = utils.bigNumberify('996006981039903216');
    await token1.transfer(pair.address, swapAmount);
    await pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides);

    const expectedLiquidity = expandTo18Decimals(1000);
    await pair.transfer(pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY));
    await pair.burn(wallet.address, overrides);
    expect(await pair.totalSupply()).to.eq(MINIMUM_LIQUIDITY);
  });

  it('feeTo:on', async function() {
    await factory.setFeeTo(other.address);

    const token0Amount = expandTo18Decimals(1000);
    const token1Amount = expandTo18Decimals(1000);
    await addLiquidity(token0Amount, token1Amount);

    const swapAmount = expandTo18Decimals(1);
    const expectedOutputAmount = utils.bigNumberify('996006981039903216');
    await token1.transfer(pair.address, swapAmount);
    await pair.swap(expectedOutputAmount, 0, wallet.address, '0x', overrides);

    const expectedLiquidity = expandTo18Decimals(1000);
    await pair.transfer(pair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY));
    await pair.burn(wallet.address, overrides);
    expect(await pair.totalSupply()).to.eq(MINIMUM_LIQUIDITY.add('249750499251388'));
    expect(await pair.balanceOf(other.address)).to.eq('249750499251388');

    expect(await token0.balanceOf(pair.address)).to.eq(utils.bigNumberify(1000).add('249501683697445'));
    expect(await token1.balanceOf(pair.address)).to.eq(utils.bigNumberify(1000).add('250000187312969'));
  });
});
