const { isUSDToken } = require("./utilities")

async function findArbitrageRoutes(pools, tokenAmountsIn, amountInUsd) {
    let routes = []
    let amountIn

    // Iterate through each pool and compare it with every other pool
    for (let i = 0; i < pools.length; i++) {
        for (let j = 0; j < pools.length; j++) {
            // Ensure not to compare the same pool
            if (i !== j) {
                !isUSDToken(pools[i].token0.symbol)
                    ? Number(
                          (amountIn = ethers.parseUnits(
                              tokenAmountsIn[pools[i].token0.symbol],
                              "ether",
                          )),
                      )
                    : Number(
                          (amountIn = ethers.parseUnits(amountInUsd, "mwei")),
                      )

                // Assuming amountIn is a BigInt
                let profitThresholdBigInt = (amountIn * 100n) / 10n // Keep everything as BigInt
                let profitThresholdString = profitThresholdBigInt.toString() // Convert to string at the end
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
                    profitThresholdString, // [8] profit threshhold
                    pools[i].token0.symbol, // [9] token in symbol
                    pools[i].id, // [10] pool0 address
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
                    profitThresholdString, // [8] profit threshhold
                    pools[i].token0.symbol, // [9] token in symbol
                    pools[i].id, // [10] pool0 address
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

exports.findArbitrageRoutes = findArbitrageRoutes
