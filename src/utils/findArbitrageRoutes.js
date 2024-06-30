async function findArbitrageRoutes(pools, tokenInfo) {
    let routes = []

    // Iterate through each pool and compare it with every other pool
    for (let i = 0; i < pools.length; i++) {
        for (let j = 0; j < pools.length; j++) {
            // Ensure not to compare the same pool
            if (i !== j) {
                // Example route: token0 -> token1 in one pool, and token1 -> token0 in another pool
                let route1 = [
                    pools[i].token0.id, // [0] tokenIn hop1 address
                    pools[i].feeTier, // [1] pool0 Fee tier
                    pools[i].token1.id, // [2] tokenOut hop1 / tokenIn hop2 address
                    pools[j].feeTier, // [3] pool1 Fee tier
                    pools[j].token0.id, // [4] token out hop2 address
                    pools[i].token0.decimals, // [5] token in/out decimals
                    pools[i].token1.decimals, // [6] swap token decimals
                    tokenInfo[pools[i].token0.symbol].amountIn, // [7] simSwap amountIn
                    tokenInfo[pools[i].token1.symbol].profitThreshold, // [8] profit threshhold
                    pools[i].token0.symbol, // [9] token in symbol
                    pools[i].id, // [10] pool0 address
                    tokenInfo[pools[i].token1.symbol].amountIn, // [11] Flashswap amountIn
                ]
                let route2 = [
                    pools[i].token1.id, // [0] tokenIn hop1 address
                    pools[i].feeTier, // [1] pool0 Fee tier
                    pools[i].token0.id, // [2] tokenOut hop1 / tokenIn hop2 address
                    pools[j].feeTier, // [3] pool1 Fee tier
                    pools[j].token1.id, // [4] token out hop2 address
                    pools[i].token1.decimals, // [5] token in/out decimals
                    pools[i].token0.decimals, // [6] swap token decimals
                    tokenInfo[pools[i].token1.symbol].amountIn, // [7] simSwap amount in
                    tokenInfo[pools[i].token0.symbol].profitThreshold, // [8] profit threshhold
                    pools[i].token1.symbol, // [9] token in symbol
                    pools[i].id, // [10] pool0 address
                    tokenInfo[pools[i].token0.symbol].amountIn, // [11] Flashswap amountIn
                ]

                // Check if the routes are valid
                if (route1[0] === route1[4] && route1[0] !== route1[2]) {
                    // Add routes to the routes array
                    routes.push(route1)
                    // console.log("route number ", i)
                    // console.log(route1)
                }
                if (route2[0] === route2[4] && route2[0] !== route2[2]) {
                    // Add routes to the routes array
                    routes.push(route2)
                    // console.log("route number ", i)
                    // console.log(route2)
                }
            }
        }
    }
    // console.log(routes)
    // Return an object with all the routes

    return routes
}

exports.findArbitrageRoutes = findArbitrageRoutes
