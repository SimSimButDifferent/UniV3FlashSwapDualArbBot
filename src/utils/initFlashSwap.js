const { ethers } = require("hardhat")
const {
    abi: flashSwapAbi,
} = require("../../ignition/deployments/chain-31337/artifacts/FlashSwapV3#FlashSwapV3.json")
const {
    networkConfig,
    developmentChains,
} = require("../../helper-hardhat-config.js")
const { getProvider } = require("./getProvider.js")
const { networks } = require("../../hardhat.config.js")

if (developmentChains.includes(network.name)) {
    FLASHSWAP_CONTRACT_ADDRESS =
        networkConfig[networks.localhost.chainId].flashSwapV3Address
}

async function initFlashSwap() {
    const provider = getProvider()

    const flashSwap = new ethers.Contract(
        FLASHSWAP_CONTRACT_ADDRESS,
        flashSwapAbi,
        provider,
    )

    return flashSwap
}

exports.initFlashSwap = initFlashSwap
