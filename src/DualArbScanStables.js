require("./utils/getProvider")

const { data: poolsData } = require("./jsonPoolData/uniswapStablecoinPools")
const { initPools } = require("./utils/InitPools")
const { arbQuote } = require("./utils/arbQuote")

const {
    poolInformation,
    findArbitrageRoutes,
    gasEstimateToUsd,
} = require("./utils/utilities")

const pools = poolsData.pools
const amountIn100 = ethers.utils.parseUnits("100", 6)
const profitThreshold = ethers.utils.parseUnits("2", 6)
const tokenDecimals = 6

let gasEstimateUsd
let route
let amountIn
let amountOut
let minimumAmountOut

async function dualArbScanStables(pools) {
    // Initialize the pools
    const poolsArray = await initPools(pools)

    // Output pool information
    await poolInformation(pools, poolsArray)

    // Get possible arbitrage routes
    const routesObj = await findArbitrageRoutes(pools)
    const routesArray = routesObj.routes

    console.log("")
    console.log("Scanning for arbitrage opportunities")
    console.log("")

    let counter = 0

    async function runLoop() {
        counter++
        console.log("Scan run number: ", counter)
        // Create an array to hold all the promises returned by arbQuote
        const quotePromises = []

        for (let i = 0; i < routesArray.length; i++) {
            const route = routesArray[i]
            // Push the promise returned by arbQuote into the array
            quotePromises.push(arbQuote(route, amountIn100, i, profitThreshold))
        }

        // Wait for all promises to resolve
        const outputs = await Promise.all(quotePromises)

        return quotePromises
    }

    runLoop()
    // Run the loop every 20 seconds
    setInterval(runLoop, 20000) // 20000 milliseconds = 20 seconds
}

dualArbScanStables(pools).catch((error) => {
    console.error(error)
})
