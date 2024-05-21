const { ethers } = require("ethers")
const { Chainlink } = require("dev3-sdk")
const { getProvider } = require("./getProvider")

function sqrtToPrice(sqrt, decimals0, decimals1, token0IsInput) {
    const numerator = sqrt ** 2
    const denominator = 2 ** 192
    let ratio = numerator / denominator
    const shiftDecimals = Math.pow(10, decimals1 - decimals0)
    ratio = ratio * shiftDecimals
    if (!token0IsInput) {
        ratio = 1 / ratio
    }

    return ratio
}

async function getEthPriceUsd() {
    const ethSDK = Chainlink.instance(
        "https://ethereum.publicnode.com",
        Chainlink.PriceFeeds.ETH,
    )

    const roundData = await ethSDK.getFromOracle(ethSDK.feeds.ETH_USD)
    const ethPriceUsdBigInt = roundData.answer

    return ethPriceUsdBigInt
}

// function to convert gasEstimate into usd value
async function gasEstimateToUsd(gas) {
    const provider = getProvider()

    const gasPrice = BigInt(await provider.getGasPrice())
    const gasEstimate = BigInt(gas)

    const ethPriceUsd = ethers.utils.formatUnits(await getEthPriceUsd(), "8")

    const gasTotal = gasPrice * gasEstimate

    const gasEstimateEth = Number(BigInt(gasTotal)) / 1e18

    const gasEstimateUsd = gasEstimateEth * Number(ethPriceUsd)

    return gasEstimateUsd.toFixed(6)
}

function isUSDToken(symbol) {
    const usdTokens = ["USDT", "USDC"]

    return usdTokens.includes(symbol)
}

module.exports = {
    sqrtToPrice,
    gasEstimateToUsd,
    isUSDToken,
    getEthPriceUsd,
}
