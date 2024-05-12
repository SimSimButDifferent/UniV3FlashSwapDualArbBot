require("./utils/getProvider")
const {
    data: poolsData,
} = require("./context/jsonPoolData/uniswapStablecoinPools")
const { initPools } = require("./utils/InitPools")

const { sqrtToPrice } = require("./utils/utilities")

QUOTER_2_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

const pools = poolsData.pools

async function dualArbScanStables(pools) {
    // // Print the pool data

    for (let i = 0; i < pools.length; i++) {
        const pool = pools[i]
        const token0 = pool.token0
        const token1 = pool.token1
        const feeTier = pool.feeTier
        const liquidity = pool.liquidity
        const token0decimals = token0.decimals
        const token1decimals = token1.decimals

        // Get the price of the pool

        if (token0decimals >= token1decimals) {
            console.log(
                `${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) Liquidity = ${ethers.utils.formatUnits(liquidity, token0decimals)} - Address: ${pool.id}`,
            )
        } else {
            console.log(
                `${token0.symbol}/${token1.symbol} - Fee tier(${feeTier}) Liquidity = ${ethers.utils.formatUnits(liquidity, 18)} Address: ${pool.id}`,
            )
        }
        console.log(liquidity)
    }

    // Initialize the pools
    const poolsArray = await initPools(pools)

    // Get the slot0 data
    let slot0Array = []
    for (let i = 0; i < poolsArray.length; i++) {
        const slot0 = await poolsArray[i].slot0()
        slot0Array.push(slot0)
        console.log(await slot0Array[i].sqrtPriceX96.toString())
    }
}

dualArbScanStables(pools)
