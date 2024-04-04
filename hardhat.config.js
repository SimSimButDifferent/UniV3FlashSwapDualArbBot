require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-ethers")
require("ethers")
require("hardhat-deploy")
require("dotenv").config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
// const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL
const BASE_MAINNET_RPC_URL = process.env.BASE_MAINNET_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
// const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            forking: {
                url: BASE_MAINNET_RPC_URL,
                blockNumber: 12713565,
            },
            chainId: 31337,
            blockConfirmations: 1,
        },
        localhost: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        // BASE network
        "base-mainnet": {
            url: "https://mainnet.base.org",
            accounts: [PRIVATE_KEY_2],
            chainId: 8453,
            gasPrice: 1000000000,
        },
        "base-sepolia": {
            url: "https://sepolia.base.org",
            accounts: [PRIVATE_KEY_2],
            chainId: 84532,
            gasPrice: 1000000000,
        },
        "base-local": {
            url: "http://localhost:8545",
            accounts: [PRIVATE_KEY],
            gasPrice: 1000000000,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            "base-sepolia": BASESCAN_API_KEY,
            "base-mainnet": BASESCAN_API_KEY,
        },
        customChains: [
            {
                network: "base-sepolia",
                chainId: 84532,
                urls: {
                    apiURL: "https://api-sepolia.basescan.org/api",
                    browserURL: "https://sepolia.basescan.org",
                },
            },
            {
                network: "base-mainnet",
                chainId: 8453,
                urls: {
                    apiURL: "https://api.basescan.org/api",
                    browserURL: "https://basescan.org",
                },
            },
        ],
    },

    solidity: {
        compilers: [
            {
                version: "0.8.24",
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
}
