const ethers = require("ethers")
require("dotenv").config()

// The Alchemy API URL from .env file
const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API

// Function to get the provider
function getProvider() {
    // const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_API)
    const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_API)

    return provider
}

exports.getProvider = getProvider
