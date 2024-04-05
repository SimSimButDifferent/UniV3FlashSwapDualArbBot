const hre = require("hardhat")
const { ethers } = require("hardhat")
// const { mainnet } = require("./context/UniswapContractAddresses.json")

const networkConfig = {
    1: {
        name: "mainnet",
    },
    31377: {
        name: "localhost",
    },
    11155111: {
        name: "sepolia",
    },
    84532: {
        name: "base-sepolia",
    },
    8453: {
        name: "base-mainnet",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = { networkConfig, developmentChains }
