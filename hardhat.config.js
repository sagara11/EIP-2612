require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  defaultNetwork: "develop",
  networks: {
    hardhat: {},
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/ed07f93396a94062945b28125bf6f8f5",
      accounts: [
        PRIAVTE_KEY,
      ],
    },
    polygonMumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/GWt1lXNDpSF4krdpwWVUGYsno7n-YMha",
      accounts: [
        PRIAVTE_KEY,
      ],
    },
    develop: {
      url: "http://127.0.0.1:8545/",
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
