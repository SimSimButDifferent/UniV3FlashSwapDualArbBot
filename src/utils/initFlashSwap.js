const { ethers } = require("hardhat")
const {
    abi: flashSwapAbi,
} = require("../../out/FlashSwapV3.sol/FlashSwapV3.json")

const { getProvider } = require("./getProvider.js")

FLASHSWAP_CONTRACT_ADDRESS = "0xf42ec71a4440f5e9871c643696dd6dc9a38911f8"

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
