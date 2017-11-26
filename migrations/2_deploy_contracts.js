const TokenAllocation = artifacts.require('./TokenAllocation.sol');

/*
var icoManager = "0x0";     // Public key for the backend script that mints tokens
var foundersWallet = "0x0"; // Public key of Kosta's wallet that will receive tokens after vesting
var partnersWallet = "0x0"; // Public key of the wallet that allocates early contributors' bonus
var totalWeiGathered = 0;   // Total sum of all the money gathered throughout the crowdsale
*/

// Test data corresponding to ../testrpc.sh, see the keys there
// var icoManager = "0x7fb504439b8a99cf1e31dfd0490fd19a7bb502d0";     // Public key for the manager that launches phases and pauses
// var icoBackend = "0x7fb504439b8a99cf1e31dfd0490fd19a7bb502d0";     // Public key for the backend script that mints tokens
// var foundersWallet = "0xb8d3051d9a97247e592cbc49a1dc14cfa2c0aee0"; // Public key of Kosta's wallet that will receive tokens after vesting
// var partnersWallet = "0xb8d3051d9a97247e592cbc49a1dc14cfa2c0aee0"; // Public key of the wallet that allocates early contributors' bonus
// var emergencyManager = "0xb8d3051d9a97247e592cbc49a1dc14cfa2c0aee0"; // Public key of the wallet that can perform emergency functions

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
      throw new Error('not defined');

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

  deployer.deploy(TokenAllocation, ...accounts);
};
