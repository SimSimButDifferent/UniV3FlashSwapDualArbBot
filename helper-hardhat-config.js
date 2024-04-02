const hre = require("hardhat")
const { ethers } = require("hardhat")

const networkConfig = {
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
