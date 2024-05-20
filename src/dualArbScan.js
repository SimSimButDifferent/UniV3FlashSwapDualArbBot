require("./utils/getProvider")

const { data: poolsData } = require("./jsonPoolData/uniswapPools")
const { initPools } = require("./utils/InitPools")
const { arbQuote } = require("./utils/arbQuote")

const { poolInformation, findArbitrageRoutes } = require("./utils/utilities")

const pools = poolsData.pools
let amountIn
const amountInUsd = "100"
const profitThreshold = ethers.utils.parseUnits("10", 6)

async function dualArbScan(pools) {
    // Initialize the pools
    const poolsArray = await initPools(pools)

    console.log(`found ${poolsArray.length} pools`)

    // Output pool information
    const tokenAmountsIn = await poolInformation(pools, poolsArray, amountInUsd)

    // Get possible arbitrage routes
    const routesArray = await findArbitrageRoutes(
        pools,
        tokenAmountsIn,
        amountInUsd,
    )

    // find amountin for each route. If token0  in usd token then amountin = amountInUsd. otherwise call

    console.log("")
    console.log(
        `Scanning ${routesArray.length} routes for arbitrage opportunities`,
    )
    console.log("")

    let counter = 0
    let tradeCounter = 0
    let ProfitCounter = 0

    async function runLoop() {
        counter++
        console.log("Scan run number: ", counter)
        // Create an array to hold all the promises returned by arbQuote
        const quotePromises = []

        for (let i = 0; i < routesArray.length; i++) {
            const route = routesArray[i]
            amountIn = route[7]
            // Push the promise returned by arbQuote into the array
            quotePromises.push(arbQuote(route, amountIn, i, profitThreshold))
        }

        // Wait for all promises to resolve
        const outputs = await Promise.all(quotePromises)

        for (let i = 0; i < outputs.length; i++) {
            if (outputs[i][1] == true) {
                tradeCounter++
                ProfitCounter += outputs[i][0].profit
            }
        }

        console.log("Number of trades executed: ", tradeCounter)
        console.log("Total Profit for this session: $", ProfitCounter)
        return quotePromises
    }

    runLoop()
    // Run the loop every 20 seconds
    setInterval(runLoop, 20000) // 20000 milliseconds = 20 seconds
}

dualArbScan(pools).catch((error) => {
    console.error(error)
})

exports.dualArbScan = dualArbScan
