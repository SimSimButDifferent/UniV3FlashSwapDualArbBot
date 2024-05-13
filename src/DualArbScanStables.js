require("./utils/getProvider")
const { sqrt } = require("@uniswap/sdk-core")
const {
    data: poolsData,
} = require("./context/jsonPoolData/uniswapStablecoinPools")
const { initPools } = require("./utils/InitPools")
const { getProvider } = require("./utils/getProvider")

const { sqrtToPrice, findArbitrageRoutes } = require("./utils/utilities")

QUOTER_2_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

const pools = poolsData.pools

async function dualArbScanStables(pools) {
    // Initialize the pools
    const poolsArray = await initPools(pools)

    // Get possible routes
    const routesObj = findArbitrageRoutes(pools)
    const routesArray = routesObj.routes
    const routesArrayLength = routesArray.length

    // Get the slot0 data
    let PriceArray = []
    // Create an array of pool data.

    // for (let i = 0; i < pools.length; i++) {
    //     const pool = pools[i]
    //     const token0 = pool.token0
    //     const token1 = pool.token1
    //     const feeTier = pool.feeTier
    //     const liquidity = pool.liquidity
    //     const token0decimals = token0.decimals
    //     const token1decimals = token1.decimals

    //     // Get the price of the pool
    //     const slot0 = await poolsArray[i].slot0()
    //     const sqrtPriceLimitX96 = slot0.sqrtPriceX96
    //     const price = sqrtToPrice(
    //         sqrtPriceLimitX96,
    //         token0decimals,
    //         token1decimals,
    //         true,
    //     )

    //     // Get the price of the pool

    //     if (token0decimals >= token1decimals) {
    //         console.log(
    //             `${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) Liquidity = ${ethers.utils.formatUnits(liquidity, token0decimals)} - Address: ${pool.id}`,
    //         )
    //     } else {
    //         console.log(
    //             `${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) Liquidity = ${ethers.utils.formatUnits(liquidity, 18)} Address: ${pool.id}`,
    //         )
    //     }
    //     console.log(`${token0.symbol}/${token1.symbol} - Price: ${price}`)
    // }
}

dualArbScanStables(pools)
