const Promise = require('bluebird');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const run = require(path.resolve(process.env.HOME, 'projects/firebase-tokensale/scripts/work'));

const TokenAllocation = artifacts.require('./TokenAllocation.sol');
const Cappasity = artifacts.require('./Cappasity.sol');

// setup timeout
Cappasity.synchronization_timeout = 60 * 60 * 1000; // 60 minutes
TokenAllocation.synchronization_timeout = 60 * 60 * 1000; // 60 minutes

module.exports = async function() {
  const instance = await TokenAllocation.deployed();
  const cappInstance = Cappasity.at(await instance.tokenContract());

  cappInstance.synchronization_timeout = Cappasity.synchronization_timeout;
  instance.synchronization_timeout = TokenAllocation.synchronization_timeout;

  let account;
  let saftWallet;

  switch (artifacts.options.network) {
    case 'live':
      account = '0x005c1E464F8d4422e08B0620C7ADcdcBbe0FB240';
      saftWallet = '0x009feA728C1eCda7eBa9877009b3c859BA5ec844';
      break;

    case 'ropsten':
      account = '0x00C87c16690bCD086d0F8F9216806C69f35ec12A';
      saftWallet = '0x00C87c16690bCD086d0F8F9216806C69f35ec12A';
      break;

    default:
      account = _accounts[1];
      saftWallet = _accounts[9];
  }

  console.info('Updating transations with %s', account);

  const data = fs.createReadStream(`${process.cwd()}/data/payouts.csv`);
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
      const { user, saft, wallet: _wallet, usd, capp, bonus } = payout;

      const wallet = _wallet.indexOf('0x') === 0 ? _wallet : `0x${_wallet}`;
      const balance = await cappInstance.balanceOf(wallet);

      if (balance.gte(capp, 10)) {
        process.stdout.write('.');
        return null;
      }

      const payoutRef = database.ref(`/payouts/${user}/phase_one`);
      const txData = await payoutRef.once('value').then(s => s.val());

      if (txData != null) {
        if (txData.state === 'pending') {
          console.warn('User %s - %s pending', user, capp);
        } else {
          process.stdout.write('.');
        }
        return null;
      }

      try {
        const destination = saft === 'yes' ? saftWallet : wallet;

        // ensure we've set it
        await payoutRef.set({
          state: 'pending',
          wallet,
          capp,
          usd,
          bonus,
          saft,
          destination,
        });

        web3.personal.unlockAccount(account, process.env.ACCOUNT_PASSWORD, `0x${Number(5 * 60).toString(16)}`);
        const tx = await instance.issueTokensWithCustomBonus(destination, usd, capp, bonus, { from: account });

        // issue log
        console.info('issued [%s] %s - %s - %s', saft, destination, capp, tx.tx);
        // lift lock
        await payoutRef.update({ state: 'completed' });
      } catch (e) {
        console.error('Failed to finish', e.message);
      }
    }, { concurrency: 50 });
  });
};
