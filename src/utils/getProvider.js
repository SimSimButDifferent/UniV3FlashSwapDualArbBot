const ethers = require("ethers")
require("dotenv").config()

// The ARBITRUM API URL from .env file
const ARBITRUM_MAINNET_API = process.env.ARBITRUM_MAINNET_API

// Function to get the provider
function getProvider() {
    // const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_MAINNET_API)
    const provider = new ethers.JsonRpcProvider(ARBITRUM_MAINNET_API)

    return provider
}

exports.getProvider = getProvider
