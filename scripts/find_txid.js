const Promise = require('bluebird');
const findIndex = require('lodash/findIndex');
const pick = require('lodash/pick');
const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');
const run = require(path.resolve(process.env.HOME, 'projects/firebase-tokensale/scripts/work'));

const TokenAllocation = artifacts.require('./TokenAllocation.sol');
const Cappasity = artifacts.require('./Cappasity.sol');

module.exports = async function findtxIds() {
  const instance = await TokenAllocation.deployed();
  const cappInstance = Cappasity.at(await instance.tokenContract());
  const wallet = argv.wallet;
  const web3 = this.web3;

  // started distributing at 4639984
  const filter = web3.eth.filter({
    fromBlock: 4639984,
    address: '0xf67acb7b9226e482afcf7f08aac9466c50c19d9c',
  });

  const result = await Promise.fromCallback(next => filter.get(next));
  const txHashes = result.reduce((all, log) => {
    all[log.transactionHash] = true;
    return all;
  }, {});

  const transactions = await Promise.map(Object.keys(txHashes), txId => (
    Promise.fromCallback(next => web3.eth.getTransaction(txId, next))
  ), { concurrency: 50 });

  // parse tx input
  // method 0x76d06add
  // const args = tx.input.slice('0x76d06add'.length)
  // const wallet = args.substr(0, 64)
  // const contribution = args.substr(64, 64)
  // const tokens = args.substr(128, 64)
  // const bonus = args.substr(192, 64)
  const METHOD_LENGTH = '0x76d06add'.length;
  const parsedTxs = transactions.map(tx => ({
    txId: tx.hash,
    destination: tx.input.substr(METHOD_LENGTH, 64).replace(/^0{24}/, '0x').toLowerCase(),
    usd: parseInt(tx.input.substr(METHOD_LENGTH + 64, 64), 16).toString(),
    capp: parseInt(tx.input.substr(METHOD_LENGTH + 128, 64), 16).toString(),
    bonus: parseInt(tx.input.substr(METHOD_LENGTH + 192, 64), 16).toString(),
  }));

  const foundIndexes = Object.create(null);

  return run(async (database) => {
    const payouts = await database.ref('/payouts').once('value').then(s => s.val());
    const fields = ['usd', 'capp', 'bonus', 'destination'];
    const work = [];

    for (const [userId, payout] of Object.entries(payouts)) {
      const savedDataKey = payout.phase_one ? 'phase_one' : 'phase_one_locked';
      const payoutData = payout[savedDataKey];

      // if we have saved txId - just skip
      if (payoutData.txId) continue;

      // stub or normalize destination
      if (payoutData.destination == null) {
        payoutData.destination = payoutData.wallet.toLowerCase();
      } else {
        payoutData.destination = payoutData.destination.toLowerCase();
      }

      const idx = findIndex(parsedTxs, pick(payoutData, fields));

      // ensure we have different tx
      if (foundIndexes[idx]) console.warn('matched multiple transactions:', parsedTxs[idx]);
      foundIndexes[idx] = true;

      const tx = parsedTxs[idx];

      // userId -> tx match
      console.log(userId, tx);

      // ensure we update database with transaction reference
      work.push(database.ref(`/payouts/${userId}/${savedDataKey}/txId`).set(tx.txId));
    }

    await Promise.all(work);
  }, {});
};
