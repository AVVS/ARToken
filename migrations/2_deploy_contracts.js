const TokenAllocation = artifacts.require('./TokenAllocation.sol');
const config = require('../truffle');

const info = [
  'icoManager: %s',
  'icoBackend: %s',
  'foundersWallet: %s',
  'partnersWallet: %s',
  'emergencyManager: %s\n',
].join('\n');

module.exports = function(deployer, network, _accounts) {
  let accounts;
  switch (network) {
    case 'live':
      accounts = [
        '0x00dC895137042E1b0959E85E60747Ed9B58f0701',
        '0x005c1E464F8d4422e08B0620C7ADcdcBbe0FB240',
        '0x008ebEE8422f9Fe222a9B2C4A14A595846a457a4',
        '0x00BBb48739cfd64B622776a22A57d741E48164C4',
        '0x004899c9bAE1129fE359e6FAa2C97Ab6095C7335',
      ];
      break;

    case 'ropsten':
      accounts = [
        '0x006EB704aB30Fd9FEe1db6561856D75D5db8fA4e',
        '0x00C87c16690bCD086d0F8F9216806C69f35ec12A',
        '0x00E5300B54F2B5AFA9e11201b5Fc048cAE52d981',
        '0x00bFeD8A3Ab20CAd28328A8ACfE7Db0700ede5c2',
        '0x004367dF01759d415b63430c6d6b242CEE2dF6de',
      ];
      break;

    default:
      accounts = _accounts.slice(0, 5);
  }

  // deployer
  console.error('\nAccounts:');
  console.error(info, ...accounts);

  // unlock for 1 hour
  if (process.env.ACCOUNT_PASSWORD && config.networks[network].from) {
    web3.personal.unlockAccount(config.networks[network].from, process.env.ACCOUNT_PASSWORD, `0x${Number(60 * 60).toString(16)}`);
  } else {
    console.warn('no account to unlock');
  }

  deployer.deploy(TokenAllocation, ...accounts);
};
