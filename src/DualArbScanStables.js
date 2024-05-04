require("./utils/getProvider")
const { pools } = require("./utils/jsonPoolData/pools")
const { initPools } = require("./utils/InitPools")
const { quoteV2GraphQuery } = require("./utils/quoteV2GraphQuery")
const { sqrtToPrice } = require("./utils/utilities")

QUOTER_2_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

async function dualArbScanStables(pools) {
    // // Initialize the pools
    // const poolsArray = await initPools(pools)

    // // Get the slot0 data
    // let slot0Array = []
    // for (let i = 0; i < poolsArray.length; i++) {
    //     // const slot0Array = []
    //     const slot0 = await poolsArray[i].slot0()
    //     slot0Array.push(slot0)
    //     // console.log(slot0Array[i])
    // }

    // // Get the sqrtPriceX96
    // for (let i = 0; i < slot0Array.length; i++) {
    //     console.log(slot0Array[i])
    // }

    // // console.log(pools)
    let pool,
        token0,
        token1,
        fee,
        poolAddress,
        tokenIn,
        tokenOut,
        poolNumber,
        quote,
        sqrtPrice,
        price

    for (let i = 0; i < pools.length; i++) {
        pool = pools[i]
        token0 = pool.token0.symbol
        token1 = pool.token1.symbol
        fee = pool.feeTier
        poolAddress = pool.id
        tokenIn = pool.token0.id
        tokenOut = pool.token1.id
        poolNumber = i

        quote = await quoteV2GraphQuery(poolAddress, tokenIn, tokenOut, i)
        sqrtPrice = quote.sqrtPriceX96

        if (token0 === "USDT") {
            price = sqrtToPrice(
                sqrtPrice,
                pool.token1.decimals,
                pool.token0.decimals,
                true,
            )
        } else {
            price = sqrtToPrice(
                sqrtPrice,
                pool.token0.decimals,
                pool.token1.decimals,
                false,
            )
        }

        console.log(
            `Pool: ${token0}/${token1} Fee: ${fee} SqrtPrice: ${sqrtPrice} Price: ${price}`,
        )
    }
}

dualArbScanStables(pools)
