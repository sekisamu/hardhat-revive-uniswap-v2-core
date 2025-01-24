const { task } = require("hardhat/config");
const { readFileSync } = require('fs');
const { join } = require('path');

task("deploy-revive", "Deploys a contract")
  .addParam("contract", "The contract name")
  .addParam("args", "Constructor arguments (comma-separated)")
  .setAction(async (taskArgs, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const contractName = taskArgs.contract;

    try {
      const abi = JSON.parse(readFileSync(join('artifacts', 'contracts', contractName, `${contractName}.json`), 'utf8'));
      const bytecode = `0x${readFileSync(join('artifacts', 'contracts', contractName, `${contractName}.polkavm`)).toString('hex')}`;

      // Create contract factory and deploy
      const factory = new hre.ethers.ContractFactory(abi, bytecode, deployer);

      // Log constructor args to verify
      const constructorArgs = taskArgs.args.split(',');
      console.log("Constructor Arguments:", constructorArgs);

      const contract = await factory.deploy(...constructorArgs);

      await contract.waitForDeployment();
      console.log(`${contractName} deployed to:`, await contract.getAddress());
    } catch (error) {
      console.error("Deployment failed:", error);
      process.exit(1);
    }
  });
