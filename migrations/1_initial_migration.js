const Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  let owner;
  switch (network) {
    case 'live':
      throw new Error('not configured');

    case 'ropsten':
      owner = '0x006eb704ab30fd9fee1db6561856d75d5db8fa4e';
      break;

    default:
      owner = accounts[0];
  }

  deployer.deploy(Migrations);
};
