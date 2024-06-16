const { ethers } = require("ethers")
const { isUSDToken } = require("./utilities")
const { data: poolsData } = require("../jsonPoolData/uniswapPools.json")
const pools = poolsData.pools
const amountInUsd = "100"

/**
 * @dev This function logs the pool information
 * @param {*} pools
 * @param {*} amountInUsd
 * @returns token amounts in for each token based on
 * the amountInUsd
 */
async function poolInformation(pools, amountInUsd) {
    // Turn off when hardhat tests are running
    console.log("List of pools to scan")
    console.log("-----------------------")

    let tokenAmountsIn = {}

    for (let i = 0; i < pools.length; i++) {
        try {
            const pool = pools[i]
            const token0 = pool.token0
            const token1 = pool.token1
            const feeTier = pool.feeTier
            const totalValueLockedUSD = pool.totalValueLockedUSD

            const priceToken0 = parseFloat(pool.token0Price)
            const priceToken1 = parseFloat(pool.token1Price)

            let price

            console.log(`price token 0: ${priceToken0}`, typeof priceToken0)
            console.log(`price token 1: ${priceToken1}`, typeof priceToken1)

            if (isUSDToken(token0.symbol)) {
                price = ethers.parseUnits(priceToken0.toFixed(6), 6)
                tokenAmountsIn[token1.symbol] = (
                    Number(amountInUsd) / priceToken0
                ).toString()
            } else {
                price = ethers.parseUnits(priceToken1.toFixed(6), 6)
            }

            // Log pool information - Turn off when running hardhat tests!

            console.log(
                `\n${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) - Price: ${price}`,
            )
            console.log(
                `${token0.symbol}/${token1.symbol} - Amount locked in USD: ${Number(totalValueLockedUSD).toFixed(2)} $ - Address: ${pool.id}`,
            )
            console.log("-----------------------")
        } catch (error) {
            console.error(`Error processing pool at index ${i}:`, error)
        }
    }
    console.log("\nNon USD token amountIn's calculated", tokenAmountsIn)

    return tokenAmountsIn
}

poolInformation(pools, amountInUsd).catch((error) => {
    console.error(error)
})

exports.poolInformation = poolInformation
