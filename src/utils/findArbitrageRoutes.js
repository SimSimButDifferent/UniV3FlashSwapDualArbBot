async function findArbitrageRoutes(pools, tokenAmountsIn) {
    let routes = []
    let amountIn

    // Iterate through each pool and compare it with every other pool
    for (let i = 0; i < pools.length; i++) {
        for (let j = 0; j < pools.length; j++) {
            // Ensure not to compare the same pool
            if (i !== j) {
                amountIn = tokenAmountsIn[pools[i].token0.symbol]

                // Assuming amountIn is a BigInt
                let profitThresholdBigInt = amountIn / 100n // Keep everything as BigInt

                // Example route: token0 -> token1 in one pool, and token1 -> token0 in another pool
                let route1 = [
                    pools[i].token0.id, // [0] tokenIn hop1 address
                    pools[i].feeTier, // [1] pool0 Fee tier
                    pools[i].token1.id, // [2] tokenOut hop1 / tokenIn hop2 address
                    pools[j].feeTier, // [3] pool1 Fee tier
                    pools[j].token0.id, // [4] token out hop2 address
                    pools[i].token0.decimals, // [5] token in/out decimals
                    pools[i].token1.decimals, // [6] swap token decimals
                    amountIn, // [7] amount in
                    profitThresholdBigInt, // [8] profit threshhold
                    pools[i].token0.symbol, // [9] token in symbol
                    pools[i].id, // [10] pool0 address
                ]
                let route2 = [
                    pools[i].token1.id, // [0] tokenIn hop1 address
                    pools[i].feeTier, // [1] pool0 Fee tier
                    pools[i].token0.id, // [2] tokenOut hop1 / tokenIn hop2 address
                    pools[j].feeTier, // [3] pool1 Fee tier
                    pools[j].token1.id, // [4] token out hop2 address
                    pools[i].token1.decimals, // [5] token in/out decimals
                    pools[i].token0.decimals, // [6] swap token decimals
                    amountIn, // [7] amount in
                    profitThresholdBigInt, // [8] profit threshhold
                    pools[i].token1.symbol, // [9] token in symbol
                    pools[i].id, // [10] pool0 address
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
    console.log(routes)
    // Return an object with all the routes

    return routes
}

exports.findArbitrageRoutes = findArbitrageRoutes
