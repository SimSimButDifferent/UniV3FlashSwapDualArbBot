/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-foundry")
require("dotenv").config()

const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API

module.exports = {
    networks: {
        hardhat: {
            forking: {
                url: ALCHEMY_MAINNET_API,
                blockNumber: 19709300,
                gasLimit: 12000000,
            },
        },
        localhost: {
            url: "http://localhost:8545",
            chainId: 31337,
        },
    },
    solidity: "0.7.6",
}
