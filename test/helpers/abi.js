const abi = require('ethereumjs-abi')

const parameterTypes = ['address'];
const parameterValues = ['0x711c5596d98081230bee9c8bc0c15d94eda16151'];
const prodParameterValues = ['0xf67acb7b9226e482afcf7f08aac9466c50c19d9c'];

const encoded = abi.rawEncode(parameterTypes, parameterValues);
const prodEncoded = abi.rawEncode(parameterTypes, prodParameterValues);

console.log(encoded.toString('hex'));
console.log(prodEncoded.toString('hex'));

const tokenTypes = ['address', 'address', 'address', 'address', 'address'];
const tokenValues = [
  '0x006EB704aB30Fd9FEe1db6561856D75D5db8fA4e',
  '0x00C87c16690bCD086d0F8F9216806C69f35ec12A',
  '0x00E5300B54F2B5AFA9e11201b5Fc048cAE52d981',
  '0x00bFeD8A3Ab20CAd28328A8ACfE7Db0700ede5c2',
  '0x004367dF01759d415b63430c6d6b242CEE2dF6de',
];
const prodValues = [
  '0x00dC895137042E1b0959E85E60747Ed9B58f0701',
  '0x005c1E464F8d4422e08B0620C7ADcdcBbe0FB240',
  '0x008ebEE8422f9Fe222a9B2C4A14A595846a457a4',
  '0x00BBb48739cfd64B622776a22A57d741E48164C4',
  '0x004899c9bAE1129fE359e6FAa2C97Ab6095C7335',
];

const token = abi.rawEncode(tokenTypes, tokenValues);
const prodToken = abi.rawEncode(tokenTypes, prodValues);

console.log(token.toString('hex'));
console.log(prodToken.toString('hex'));

const vestingTypes = ['address', 'address'];
const vestingValues = [
  '0x00E5300B54F2B5AFA9e11201b5Fc048cAE52d981',
  '0x59f212Ca3F26A3263Fc3dF4108b035c12e3583fD'
];

const vestingABI = abi.rawEncode(vestingTypes, vestingValues);

console.log(vestingABI.toString('hex'));
