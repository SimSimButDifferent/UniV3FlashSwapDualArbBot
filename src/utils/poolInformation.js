const { getTokenAmountsIn } = require("./getTokenAmountsIn")

// FOR TESTING
const { data: poolsData } = require("../jsonPoolData/arbitrumUniPools.json")
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
    // console.log("List of pools to scan")
    // console.log("-----------------------")

    let tokenAmountsIn
    let tokens = {}

    for (let i = 0; i < pools.length; i++) {
        try {
            const pool = pools[i]
            const token0 = pool.token0
            const token1 = pool.token1
            const feeTier = pool.feeTier
            const totalValueLockedUSD = pool.totalValueLockedUSD

            const token0Address = pool.token0.id
            const token1Address = pool.token1.id
            const token0Decimals = pool.token0.decimals
            const token1Decimals = pool.token1.decimals

            tokens[token0.symbol] = {
                address: token0Address,
                decimals: token0Decimals,
            }

            tokens[token1.symbol] = {
                address: token1Address,
                decimals: token1Decimals,
            }

            // Log pool information - Turn off when running hardhat tests!

            console.log(
                `\n${token0.symbol}/${token1.symbol} - Fee tier(${feeTier})`,
            )
            console.log(
                `${token0.symbol}/${token1.symbol} - Amount locked in USD: ${Number(totalValueLockedUSD).toFixed(2)} $ - Address: ${pool.id}`,
            )
            console.log("-----------------------")
        } catch (error) {
            console.error(`Error processing pool at index ${i}:`, error)
        }
        console.log(tokens)
    }

    tokenAmountsIn = await getTokenAmountsIn(tokens, amountInUsd)

    return tokenAmountsIn
}

poolInformation(pools, amountInUsd).catch((error) => {
    console.error(error)
})

exports.poolInformation = poolInformation
