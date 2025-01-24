const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");  

module.exports = buildModule("StorageModule", (m) => {  
  const deployer = m.getAccount(0);  
  const initialValue = m.getParameter("initialValue", 0);  
  const storage = m.contract("Storage", [initialValue], {  
    from: deployer,  
  });  
  return { storage };  
});  