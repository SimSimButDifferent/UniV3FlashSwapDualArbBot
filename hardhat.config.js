require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-foundry")

require("dotenv").config()

const {
    ALCHEMY_MAINNET_API,
    BOT_PRIVATE_KEY,
    ETHERSCAN_API_KEY,
    BASESCAN_API_KEY,
} = process.env

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
            accounts: BOT_PRIVATE_KEY ? [BOT_PRIVATE_KEY] : [],
            blockConfirmations: 6,
        },
        "base-mainnet": {
            url: "https://mainnet.base.org",
            accounts: BOT_PRIVATE_KEY ? [BOT_PRIVATE_KEY] : [],
            chainId: 8453,
            blockConfirmations: 6,
        },
    },
    solidity: "0.7.6",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    ignition: {
        requiredConfirmations: 5,
    },
    mocha: {
        timeout: 120000,
    },
}
