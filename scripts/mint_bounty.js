const Promise = require('bluebird');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

const run = require(path.resolve(process.env.HOME, 'projects/firebase-tokensale/scripts/work'));
const TokenAllocation = artifacts.require('./TokenAllocation.sol');
const Cappasity = artifacts.require('./Cappasity.sol');

// setup timeout
Cappasity.synchronization_timeout = 60 * 60 * 12 * 1000; // 60 minutes - 12 hrs
TokenAllocation.synchronization_timeout = 60 * 60 * 12 * 1000; // 60 minutes - 12 hrs

module.exports = async function mint() {
  const instance = await TokenAllocation.deployed();
  const cappInstance = Cappasity.at(await instance.tokenContract());

  cappInstance.synchronization_timeout = Cappasity.synchronization_timeout;
  instance.synchronization_timeout = TokenAllocation.synchronization_timeout;

  let account;

  switch (artifacts.options.network) {
    case 'live':
      account = '0x005c1E464F8d4422e08B0620C7ADcdcBbe0FB240';
      break;

    case 'ropsten':
      account = '0x00C87c16690bCD086d0F8F9216806C69f35ec12A';
      break;

    default:
      throw new Error('unsupported network');
  }

  console.info('Updating transations with %s', account);

  const data = fs.createReadStream(`${process.cwd()}/data/bounty.csv`);
  const csv = await Promise.fromCallback(next => (
    Papa.parse(data, { header: true, error: next, complete: next.bind(null, null) })
  ));

  // this is the data we'll be working on
  const parsedData = csv.data;

  if (!process.env.ACCOUNT_PASSWORD) {
    throw new Error('specify account password via env.ACCOUNT_PASSWORD');
  }

  await run(async (database) => {
    // perform operations
    await Promise.map(parsedData, async (payout) => {
      const { wallet: _wallet, capp: _capp } = payout;

      const wallet = _wallet.toLowerCase();
      const destination = wallet;
      const capp = Math.round(_capp * 1e2);

      const payoutRef = database.ref(`/payouts/${wallet.toLowerCase()}/phase_one`);
      const txData = await payoutRef.once('value').then(s => s.val());

      if (txData != null) {
        if (txData.state === 'pending') {
          console.warn('User %s - %s pending', wallet.toLowerCase(), capp);
        } else {
          process.stdout.write('.');
        }
        return null;
      }

      try {
        // ensure we've set it
        await payoutRef.set({
          state: 'pending',
          usd: '0',
          capp,
          bonus: capp,
          destination,
          type: 'bounty',
        });

        web3.personal.unlockAccount(account, process.env.ACCOUNT_PASSWORD, 15 * 60 /* 15 min */);
        const tx = await instance.issueTokensWithCustomBonus(destination, '0', capp, capp, { from: account });

        // issue log
        console.info('bounty issued %s - %s - %s', destination, capp, tx.tx);
        // lift lock
        await payoutRef.update({ state: 'completed', txId: tx.tx });
      } catch (e) {
        console.error('Failed to finish', e.message);
      }

      return null;
    }, { concurrency: 50 });
  });
};
