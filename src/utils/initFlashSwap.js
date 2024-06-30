const { ethers, network } = require("hardhat")
const {
    abi: flashSwapAbi,
} = require("../../ignition/deployments/chain-31337/artifacts/FlashSwapV3#FlashSwapV3.json")
// const {
//     abi: flashSwapAbi,
// } = require("../../ignition/deployments/chain-42161/artifacts/FlashSwapV3#FlashSwapV3.json")
const {
    networkConfig,
    developmentChains,
} = require("../../helper-hardhat-config.js")
const { getProvider } = require("./getProvider.js")
const { networks } = require("../../hardhat.config.js")

// let FLASHSWAP_CONTRACT_ADDRESS

// if (developmentChains.includes(network.name)) {
//     FLASHSWAP_CONTRACT_ADDRESS =
//         networkConfig[networks.localhost.chainId].flashSwapV3Address
// } else {
//     FLASHSWAP_CONTRACT_ADDRESS =
//         networkConfig[networks.arbitrum.chainId].flashSwapV3Address
// }

FLASHSWAP_CONTRACT_ADDRESS = "0xf812197DbdbcD0f80cD003C20f695dc8d06bC3b0"
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
