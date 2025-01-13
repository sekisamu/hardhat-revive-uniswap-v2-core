// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StorageModule", (m) => {
  const deployer = m.getAccount(0);

  // Define the parameter for the initial value to store
  const initialValue = m.getParameter("initialValue", 0); // Default to 0 if not provided

  // Deploy the Storage contract with the initial value as a constructor argument
  const storage = m.contract("Storage", [initialValue], {
    from: deployer
  });

  // Return the deployed contract reference
  return { storage };
});
