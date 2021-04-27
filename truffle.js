require('babel-register');
require('babel-polyfill');
require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*', // eslint-disable-line camelcase
        },
        ganache: {
            host: 'localhost',
            port: 8545,
            network_id: '*', // eslint-disable-line camelcase
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_API_KEY);
            },
            gas: 5000000,
            network_id: 4,
            gasPrice: 25000000000,
        },
        testnet: {
            provider: function () {
                return new HDWalletProvider(process.env.MNEMONIC, `https://data-seed-prebsc-1-s1.binance.org:8545`, 0, 9);
                // confirmations: 10,
                // timeoutBlocks: 200,
                // skipDryRun: true
            },
            network_id: 97,
            gasPrice: 10000000000, // 10 Gwei
        },
        bsc: {
            provider: function () {
                return new HDWalletProvider(process.env.MNEMONIC, `https://bsc-dataseed1.binance.org`, 0, 9);
                // confirmations: 10,
                // timeoutBlocks: 200,
                // skipDryRun: true
            },
            network_id: 56,
            gasPrice: 10000000000, // 10 Gwei
        },
    },
    solc: {
        version: "0.4.24",
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};