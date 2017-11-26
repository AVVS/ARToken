const abi = require('ethereumjs-abi')

const parameterTypes = ['address'];
const parameterValues = ['0x711c5596d98081230bee9c8bc0c15d94eda16151'];

const encoded = abi.rawEncode(parameterTypes, parameterValues);

console.log(encoded.toString('hex'));

const tokenTypes = ['address', 'address', 'address', 'address', 'address'];
const tokenValues = [
  '0x006EB704aB30Fd9FEe1db6561856D75D5db8fA4e',
  '0x00C87c16690bCD086d0F8F9216806C69f35ec12A',
  '0x00E5300B54F2B5AFA9e11201b5Fc048cAE52d981',
  '0x00bFeD8A3Ab20CAd28328A8ACfE7Db0700ede5c2',
  '0x004367dF01759d415b63430c6d6b242CEE2dF6de',
];

const token = abi.rawEncode(tokenTypes, tokenValues);

console.log(token.toString('hex'));
