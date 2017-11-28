const Migrations = artifacts.require("./Migrations.sol");
const config = require('../truffle');

module.exports = function(deployer, network, accounts) {
  // unlock for 1 hour
  if (process.env.ACCOUNT_PASSWORD && config.networks[network].from) {
    web3.personal.unlockAccount(config.networks[network].from, process.env.ACCOUNT_PASSWORD, `0x${Number(60 * 60).toString(16)}`);
  } else {
    console.warn('no account to unlock');
  }

  deployer.deploy(Migrations);
};
