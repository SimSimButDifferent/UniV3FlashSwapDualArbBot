require("./utils/getProvider")

const { data: poolsData } = require("./jsonPoolData/uniswapPools")
const { initPools } = require("./utils/InitPools")
const { arbQuote } = require("./utils/arbQuote")
const { findArbitrageRoutes } = require("./utils/findArbitrageRoutes")
const { poolInformation } = require("./utils/poolInformation")

// Config Variables

// Get the pools array from json file
const pools = poolsData.pools
// Set the amount in usd for each trade
// For different erc-20 tokens this amount will be converted to the token amount
const amountInUsd = "100"

/**
 * @dev You can use BATCH_SIZE and BATCH_INTERVAL to control the number of compute units that you use with your provider API key.
 */

// Set the batch size and interval to give control over the number of promises executed per second.
const BATCH_SIZE = 10 // Number of promises to execute in each batch
// Interval between batches in milliseconds
const BATCH_INTERVAL = 8000 // Interval between batches in milliseconds

// Main function
/**
 * @dev This function scans the pools for arbitrage opportunities
 * If there is a profitable route, it executes the trade
 * @param {*} pools
 */
async function dualArbScan(pools) {
    try {
        // Initialize the pools
        const poolsArray = await initPools(pools)
        console.log(`Found ${poolsArray.length} pools`)

        // Output pool information and token amounts in for each token included in query.
        const tokenAmountsIn = await poolInformation(pools, amountInUsd)

        // Get possible arbitrage routes where tokenIn and tokenOut are the same.
        const routesArray = await findArbitrageRoutes(
            pools,
            tokenAmountsIn,
            amountInUsd,
        )

        // Calculate how often the loop needs to run to scan all routes
        const BATCH_TOTAL = Math.ceil(routesArray.length / BATCH_SIZE)
        const EPOCH_INTERVAL = BATCH_TOTAL * BATCH_INTERVAL

        console.log("")
        console.log(
            `Scanning ${routesArray.length} routes for arbitrage opportunities\n every ${EPOCH_INTERVAL / 1000} seconds`,
        )
        console.log("")

        // Initialize counters
        let loopCounter = 0
        let tradeCounter = 0

        // Execute the batch of route quotes
        async function executeBatch(batch) {
            try {
                const outputs = await Promise.all(batch)
                for (const output of outputs) {
                    const arbitrageOpportunity = output[1]
                    if (arbitrageOpportunity === true) {
                        // Execute the trade if there is an arbitrage opportunity
                        // Update trade and profit counter.
                        tradeCounter++
                    }
                }
            } catch (error) {
                console.error("Error executing batch: ", error)
            }
        }

        async function runLoop() {
            loopCounter++
            console.log("Scan run number: ", counter)
            let batchPromises = []

            for (let i = 0; i < routesArray.length; i += BATCH_SIZE) {
                const batch = []
                console.log("Batch number: ", i / BATCH_SIZE + 1)
                for (
                    let j = 0;
                    j < BATCH_SIZE && i + j < routesArray.length;
                    j++
                ) {
                    const route = routesArray[i + j]
                    const amountInFromArray = route[7]
                    const routeNumber = i + j
                    const profitThreshold = route[8]

                    try {
                        batch.push(
                            arbQuote(
                                route,
                                amountInFromArray,
                                routeNumber,
                                profitThreshold,
                            ),
                        )
                    } catch (error) {
                        console.error(
                            `Error creating arbQuote promise for route ${i + j}: `,
                            error,
                        )
                    }
                }
                batchPromises.push(
                    executeBatch(batch).then(
                        () =>
                            new Promise((resolve) =>
                                setTimeout(resolve, BATCH_INTERVAL),
                            ),
                    ),
                )
                await Promise.all(batchPromises)
            }

            console.log("Number of trades executed: ", tradeCounter)
            console.log("Total Profit for this session: $", profitCounter)
        }

        runLoop()

        // Run every EPOCH_INTERVAL milliseconds
        // EPOCH interval = batch interval * (routes array length / batch size)
        setInterval(runLoop, EPOCH_INTERVAL)
    } catch (error) {
        console.error("Error in dualArbScan: ", error)
    }
}

dualArbScan(pools).catch((error) => {
    console.error(error)
})

exports.dualArbScan = dualArbScan
