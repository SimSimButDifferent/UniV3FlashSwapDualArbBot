/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-foundry")
require("dotenv").config()

const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API
const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY

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
        mainnet: {
            url: ALCHEMY_MAINNET_API,
            chainId: 1,
            accounts: BOT_PRIVATE_KEY !== undefined ? [BOT_PRIVATE_KEY] : [],
            blockConfirmations: 6,
        },
        // BASE network
        "base-mainnet": {
            url: "https://mainnet.base.org",
            accounts: BOT_PRIVATE_KEY !== undefined ? [BOT_PRIVATE_KEY] : [],
            chainId: 8453,
            blockConfirmations: 6,
        },
    },
    solidity: "0.7.6",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    basescan: {
        apiKey: BASESCAN_API_KEY,
    },
}
