const ethers = require("ethers")
require("dotenv").config()

const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API

function getProvider() {
    const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_API)

    return provider
}

exports.getProvider = getProvider
