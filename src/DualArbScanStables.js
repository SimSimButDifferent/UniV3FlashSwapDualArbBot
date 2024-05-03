require("./utils/getProvider")
const { pools } = require("./utils/jsonPoolData/pools")

const { quoteV2GraphQuery } = require("./utils/quoteV2GraphQuery")

async function dualArbScanStables(pools) {
    // console.log(pools)

    // const quote = await quoteV2GraphQuery(
    //     pools[0].id,
    //     pools[0].token0.id,
    //     pools[0].token1.id,
    // )
    console.log(pools[0].token1.symbol)

    for (let i = 0; i < pools.length; i++) {
        // quote = await quoteV2GraphQuery(
        //     pools[i].id,
        //     pools[i].token0.id,
        //     pools[i].token1.id,
        //     i,
        // )
        console.log(pools[i].token1.symbol)

        //     console.log(quote)
    }
}

dualArbScanStables(pools)
