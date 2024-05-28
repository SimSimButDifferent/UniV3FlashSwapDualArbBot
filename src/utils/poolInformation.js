const { isUSDToken } = require("./utilities")

/**
 * @dev This function logs the pool information
 * @param {*} pools
 * @param {*} amountInUsd
 * @returns token amounts in for each token based on
 * the amountInUsd
 */
async function poolInformation(pools, amountInUsd) {
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
            const priceToken0 = pool.token0Price
            const priceToken1 = pool.token1Price

            // Get the price of the token

            let price

            if (
                (isUSDToken(token0.symbol) && !isUSDToken(token1.symbol)) ||
                (!isUSDToken(token0.symbol) && isUSDToken(token1.symbol))
            ) {
                // Add the token price to the tokenPrices object
                if (isUSDToken(token0.symbol)) {
                    price = Number(priceToken0).toFixed(6)
                    tokenAmountsIn[token1.symbol] = (
                        Number(amountInUsd) / Number(price)
                    ).toString()
                } else {
                    price = Number(priceToken1).toFixed(6)
                }
            } else if (isUSDToken(token0.symbol) && isUSDToken(token1.symbol)) {
                price =
                    token0.symbol === "USDT"
                        ? Number(priceToken1).toFixed(6)
                        : Number(priceToken0).toFixed(6)
            }

            // Log pool information

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
exports.poolInformation = poolInformation
