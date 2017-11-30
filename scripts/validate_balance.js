const Promise = require('bluebird');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const run = require(path.resolve(process.env.HOME, 'projects/firebase-tokensale/scripts/work'));

const TokenAllocation = artifacts.require('./TokenAllocation.sol');
const Cappasity = artifacts.require('./Cappasity.sol');

module.exports = async function() {
  const instance = await TokenAllocation.deployed();
  const cappInstance = Cappasity.at(await instance.tokenContract());

  let account;
  let saftWallet;

  switch (artifacts.options.network) {
    case 'live':
      saftWallet = '0x009feA728C1eCda7eBa9877009b3c859BA5ec844';
      break;

    case 'ropsten':
      saftWallet = '0x00C87c16690bCD086d0F8F9216806C69f35ec12A';
      break;

    default:
      saftWallet = _accounts[9];
  }

  const data = fs.createReadStream(`${process.cwd()}/data/payouts.csv`);
  const csv = await Promise.fromCallback(next => (
    Papa.parse(data, { header: true, error: next, complete: next.bind(null, null) })
  ));

  // this is the data we'll be working on
  const parsedData = csv.data;

  const finalBalances = {};
  parsedData.reduce((map, datum) => {
    const { saft, wallet: _wallet, capp } = datum;
    const wallet = _wallet.indexOf('0x') === 0 ? _wallet : `0x${_wallet}`;
    const destination = (saft === 'yes' ? saftWallet : wallet).toLowerCase();

    const balance = map[destination] || 0;
    map[destination] = balance + parseInt(capp, 10);

    return map;
  }, finalBalances);

  await run(async (database) => {
    // perform operations
    await Promise.map(parsedData, async (payout) => {
      const { user, saft, wallet: _wallet, usd, capp, bonus } = payout;

      const wallet = _wallet.indexOf('0x') === 0 ? _wallet : `0x${_wallet}`;
      const destination = saft === 'yes' ? saftWallet : wallet;
      const balance = await cappInstance.balanceOf(destination);
      const expectedBalance = finalBalances[destination.toLowerCase()];

      if (balance.eq(expectedBalance) !== true) {
        const payoutRef = database.ref(`/payouts/${user}/phase_one`);
        const txData = await payoutRef.once('value').then(s => s.val());
        const balanceAtOldDestination = await cappInstance.balanceOf(txData.destination);
        console.warn(
          '[%s] - %s/%s/%s - %s - %s',
          txData.state, balance.toNumber(), balanceAtOldDestination.toNumber(), capp,
          destination, txData.destination
        );
      }
    }, { concurrency: 50 });
  });
};
