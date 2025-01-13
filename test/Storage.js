const { expect } = require("chai");

describe("Storage", function () {
  let storage;
  const initialValue = 42;

  beforeEach(async function () {
    const Storage = await ethers.getContractFactory("Storage");
    storage = await Storage.deploy(initialValue);
    await storage.waitForDeployment();
  });

  it("Should return the initial value", async function () {
    expect(await storage.storedNumber()).to.equal(initialValue);
  });

  it("Should set new value", async function () {
    const newValue = 100;
    await storage.setNumber(newValue);
    expect(await storage.storedNumber()).to.equal(newValue);
  });
});