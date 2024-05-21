require("./utils/getProvider")

const { data: poolsData } = require("./jsonPoolData/uniswapPools")
const { initPools } = require("./utils/InitPools")
const { arbQuote } = require("./utils/arbQuote")
const { findArbitrageRoutes } = require("./utils/utilities")
const { poolInformation } = require("./utils/poolInformation")

const pools = poolsData.pools
const amountInUsd = "100"
// const profitThreshold = ethers.utils.parseUnits("10", 6)
let profitThreshold
const BATCH_SIZE = 10 // Number of promises to execute in each batch
const BATCH_INTERVAL = 8000 // Interval between batches in milliseconds

async function dualArbScan(pools) {
    try {
        // Initialize the pools
        const poolsArray = await initPools(pools)
        console.log(`Found ${poolsArray.length} pools`)

        // Output pool information
        const tokenAmountsIn = await poolInformation(pools, amountInUsd)

        // Get possible arbitrage routes
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

        let counter = 0
        let tradeCounter = 0
        let profitCounter = 0

        async function executeBatch(batch) {
            try {
                const outputs = await Promise.all(batch)
                for (const output of outputs) {
                    if (output[1] === true) {
                        tradeCounter++
                        profitCounter += output[0].profit
                    }
                }
            } catch (error) {
                console.error("Error executing batch: ", error)
            }
        }

        async function runLoop() {
            counter++
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

                    try {
                        batch.push(
                            arbQuote(route, amountInFromArray, i + j, route[8]),
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
        setInterval(runLoop, EPOCH_INTERVAL) // EPOCH interval = batch interval * (routes array length / batch size)
    } catch (error) {
        console.error("Error in dualArbScan: ", error)
    }
}

dualArbScan(pools).catch((error) => {
    console.error(error)
})

exports.dualArbScan = dualArbScan
