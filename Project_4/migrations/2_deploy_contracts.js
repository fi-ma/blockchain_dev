// migrating the appropriate contracts
var FarmerRole = artifacts.require("./FarmerRole.sol");
var ProcessorRole = artifacts.require("./ProcessorRole.sol");
var DistributorRole = artifacts.require("./DistributorRole.sol");
var RoasterRole = artifacts.require("./RoasterRole.sol");
var RetailerRole = artifacts.require("./RetailerRole.sol");
var ConsumerRole = artifacts.require("./ConsumerRole.sol");
var SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = function(deployer) {
  deployer.deploy(FarmerRole);
  deployer.deploy(ProcessorRole);
  deployer.deploy(DistributorRole);
  deployer.deploy(RoasterRole);
  deployer.deploy(RetailerRole);
  deployer.deploy(ConsumerRole);
  deployer.deploy(SupplyChain);
};
