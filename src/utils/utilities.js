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

async function poolInformation(pools, poolsArray) {
    console.log("List of pools to scan")
    console.log("-----------------------")
    for (let i = 0; i < pools.length; i++) {
        const pool = pools[i]
        const token0 = pool.token0
        const token1 = pool.token1
        const feeTier = pool.feeTier
        const liquidity = pool.liquidity
        const token0decimals = token0.decimals
        const token1decimals = token1.decimals

        // Get the price of the pool
        const slot0 = await poolsArray[i].slot0()
        const sqrtPriceLimitX96 = slot0.sqrtPriceX96
        const price = sqrtToPrice(
            sqrtPriceLimitX96,
            token0decimals,
            token1decimals,
            true,
        )

        // Get the price of the pool

        if (token0decimals >= token1decimals) {
            console.log("")
            console.log(
                `${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) Liquidity = ${ethers.utils.formatUnits(liquidity, token0decimals)} - Address: ${pool.id}`,
            )
            console.log("")
        } else {
            console.log("")
            console.log(
                `${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) Liquidity = ${ethers.utils.formatUnits(liquidity, 18)} Address: ${pool.id}`,
            )
            console.log("")
        }
        console.log(`${token0.symbol}/${token1.symbol} - Price: ${price}`)
        console.log("-----------------------")
    }
}

async function findArbitrageRoutes(pools) {
    let routes = []

    // Iterate through each pool and compare it with every other pool
    for (let i = 0; i < pools.length; i++) {
        for (let j = 0; j < pools.length; j++) {
            // Ensure not to compare the same pool
            if (i !== j) {
                // Example route: token0 -> token1 in one pool, and token1 -> token0 in another pool
                let route1 = [
                    pools[i].token0.id,
                    pools[i].feeTier,
                    pools[i].token1.id,
                    pools[j].feeTier,
                    pools[j].token0.id,
                ]
                let route2 = [
                    pools[i].token1.id,
                    pools[i].feeTier,
                    pools[i].token0.id,
                    pools[j].feeTier,
                    pools[j].token1.id,
                ]

                // Add routes to the routes array
                routes.push(route1)
                routes.push(route2)
            }
        }
    }

    // Return an object with all the routes
    return { routes }
}

async function getEthPriceUsd() {
    const ethSDK = Chainlink.instance(
        "https://ethereum.publicnode.com",
        Chainlink.PriceFeeds.ETH,
    )

    const roundData = await ethSDK.getFromOracle(ethSDK.feeds.ETH_USD)
    const ethPriceUsdBigInt = roundData.answer
    // const ethPriceUsd = ethers.utils
    //     .formatUnits(ethPriceUsdBigInt, "8")
    //     .toString()

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

    // console.log("Gas estimate in ETH: ", gasEstimateEth)
    // console.log("Gas estimate in USD: ", gasEstimateUsd.toFixed(6))

    return gasEstimateUsd.toFixed(6)
}

module.exports = {
    sqrtToPrice,
    poolInformation,
    findArbitrageRoutes,
    gasEstimateToUsd,
}
