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

function findArbitrageRoutes(pools) {
    let routes = []

    // Iterate through each pool and compare it with every other pool
    for (let i = 0; i < pools.length; i++) {
        for (let j = 0; j < pools.length; j++) {
            // Ensure not to compare the same pool
            if (i !== j) {
                // Example route: token0 -> token1 in one pool, and token1 -> token0 in another pool
                let route1 = [
                    pools[i].token0.symbol,
                    pools[i].feeTier,
                    pools[i].token1.symbol,
                    pools[j].feeTier,
                    pools[j].token0.symbol,
                ]
                let route2 = [
                    pools[i].token1.symbol,
                    pools[i].feeTier,
                    pools[i].token0.symbol,
                    pools[j].feeTier,
                    pools[j].token1.symbol,
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

exports.sqrtToPrice = sqrtToPrice
exports.findArbitrageRoutes = findArbitrageRoutes
