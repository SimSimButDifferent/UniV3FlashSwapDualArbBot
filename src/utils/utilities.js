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

async function poolInformation(pools, poolsArray, amountInUsd) {
    console.log("List of pools to scan")
    console.log("-----------------------")

    let tokenPrices = {}
    let tokenAmountsIn = {}

    for (let i = 0; i < pools.length; i++) {
        try {
            const pool = pools[i]
            const token0 = pool.token0
            const token1 = pool.token1
            const feeTier = pool.feeTier
            const totalValueLockedUSD = pool.totalValueLockedUSD
            const token0decimals = token0.decimals
            const token1decimals = token1.decimals

            // Get the price of the pool
            const slot0 = await poolsArray[i].slot0()
            const sqrtPriceLimitX96 = slot0.sqrtPriceX96

            let price = sqrtToPrice(
                sqrtPriceLimitX96,
                token0decimals,
                token1decimals,
                isUSDToken(token0.symbol),
            )

            let formattedPrice = price
            if (
                (isUSDToken(token0.symbol) && !isUSDToken(token1.symbol)) ||
                (isUSDToken(token1.symbol) && !isUSDToken(token0.symbol))
            ) {
                formattedPrice = ethers.utils.formatUnits(
                    BigInt(price),
                    (isUSDToken(token0.symbol)
                        ? token1decimals
                        : token0decimals) - 1,
                )

                // Add the token price to the tokenPrices object
                if (isUSDToken(token0.symbol)) {
                    tokenPrices[token1.symbol] = formattedPrice
                    tokenAmountsIn[token1.symbol] = (
                        Number(amountInUsd) / Number(formattedPrice)
                    ).toString()
                } else {
                    tokenPrices[token0.symbol] = formattedPrice
                    tokenAmountsIn[token0.symbol] = (
                        Number(amountInUsd) / Number(formattedPrice)
                    ).toString()
                }
            } else if (isUSDToken(token0.symbol) && isUSDToken(token1.symbol)) {
                formattedPrice = price
            }

            // Log pool information
            console.log(
                `\n${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) - Price: ${formattedPrice}`,
            )
            console.log(
                `${token0.symbol}/${token1.symbol} - Amount locked in USD: ${Number(totalValueLockedUSD).toFixed(2)} $ - Address: ${pool.id}`,
            )
            console.log("-----------------------")
        } catch (error) {
            console.error(`Error processing pool at index ${i}:`, error)
        }
    }

    return tokenAmountsIn
}

async function findArbitrageRoutes(pools, tokenAmountsIn, amountInUsd) {
    let routes = []
    let amountIn

    // Iterate through each pool and compare it with every other pool
    for (let i = 0; i < pools.length; i++) {
        for (let j = 0; j < pools.length; j++) {
            // Ensure not to compare the same pool
            if (i !== j) {
                !isUSDToken(pools[i].token0.symbol)
                    ? (amountIn = ethers.utils
                          .parseUnits(
                              tokenAmountsIn[pools[i].token0.symbol],
                              pools[i].token0.decimals,
                          )
                          .toString())
                    : (amountIn = ethers.utils
                          .parseUnits(amountInUsd, 6)
                          .toString())

                // Example route: token0 -> token1 in one pool, and token1 -> token0 in another pool
                let route1 = [
                    pools[i].token0.id, // [0]
                    pools[i].feeTier, // [1]
                    pools[i].token1.id, // [2]
                    pools[j].feeTier, // [3]
                    pools[j].token0.id, // [4]
                    pools[i].token0.decimals, // [5] token in/out decimals
                    pools[i].token1.decimals, // [6] swap token decimals
                    amountIn, // [7] amount in
                ]
                let route2 = [
                    pools[i].token1.id,
                    pools[i].feeTier,
                    pools[i].token0.id,
                    pools[j].feeTier,
                    pools[j].token1.id,
                    pools[i].token1.decimals, // [5] token in/out decimals
                    pools[i].token0.decimals, // [6] swap token decimals
                    amountIn, // [7] amount in
                ]

                // Check if the routes are valid
                if (route1[0] === route1[4] && route1[0] !== route1[2]) {
                    // Add routes to the routes array
                    routes.push(route1)
                }
                if (route2[0] === route2[4] && route2[0] !== route2[2]) {
                    // Add routes to the routes array
                    routes.push(route2)
                }
            }
        }
    }

    // Return an object with all the routes
    return routes
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

    return gasEstimateUsd.toFixed(6)
}

function isUSDToken(symbol) {
    const usdTokens = ["USDT", "USDC"]

    return usdTokens.includes(symbol)
}

module.exports = {
    sqrtToPrice,
    poolInformation,
    findArbitrageRoutes,
    gasEstimateToUsd,
}
