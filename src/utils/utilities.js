const { ethers } = require("ethers")
const { Chainlink } = require("dev3-sdk")
const { getProvider } = require("./getProvider")

/**
 * @dev This function gets the price of a token
 * from the sqrtpriceX96
 * @param {*} sqrt
 * @param {*} decimals0
 * @param {*} decimals1
 * @param {*} token0IsInput
 * @returns price of the token
 */
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

/**
 * @dev This function gets the price of ETH in USD
 * @returns gas estimate in usd
 */
async function getEthPriceUsd() {
    const ethSDK = Chainlink.instance(
        "https://ethereum.publicnode.com",
        Chainlink.PriceFeeds.ETH,
    )

    const roundData = await ethSDK.getFromOracle(ethSDK.feeds.ETH_USD)
    const ethPriceUsdBigInt = roundData.answer

    return ethPriceUsdBigInt
}

/**
 * @dev This function gets the gas estimate in USD
 * from a given gas estimate
 * @param {*} gas
 * @returns gas estimate in usd
 */
async function gasEstimateToUsd(gas) {
    const provider = getProvider()

    const gasPrice = await provider.getFeeData().then((data) => data.gasPrice)

    const gasEstimate = BigInt(gas)

    const ethPriceUsd = ethers.formatUnits(await getEthPriceUsd(), "gwei")

    const gasTotal = gasPrice * gasEstimate

    const gasEstimateEth = Number(BigInt(gasTotal)) / 1e18

    const gasEstimateUsd = gasEstimateEth * Number(ethPriceUsd)

    return gasEstimateUsd.toFixed(6)
}

/**
 * @dev This function checks if the token is a USD token
 * @param {*} symbol
 * @returns boolean
 */
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
