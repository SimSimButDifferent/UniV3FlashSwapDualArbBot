const { ethers } = require("hardhat")
const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const { getProvider } = require("./getProvider")
const { sqrtToPrice } = require("./utilities")
const pools = require("./jsonPoolData/pools.js")

// Quoter Address

const QUOTER2_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

async function quoteV2GraphQuery(poolAddress, tokenIn, tokenOut, poolNumber) {
    // Create a new provider
    const provider = getProvider()

    const poolContract = new ethers.Contract(poolAddress, PoolAbi, provider)

    const slot0 = await poolContract.slot0()
    const sqrtPriceLimitX96 = slot0.sqrtPriceX96

    const token0 = await poolContract.token0()
    const token1 = await poolContract.token1()
    const fee = await poolContract.fee()

    const token0IsInput = token0 === tokenIn

    let token0Symbol
    let token1Symbol
    let decimalsIn
    let decimalsOut
    let tokenInName
    let tokenOutName

    if (token0 === tokenIn) {
        token0Symbol = pools[poolNumber].token0.symbol
        token1Symbol = pools[poolNumber].token1.symbol
        decimalsIn = pools[poolNumber].token0.decimals
        decimalsOut = pools[poolNumber].token1.decimals
        tokenInName = pools[poolNumber].token0.name
        tokenOutName = pools[poolNumber].token1.name
    } else {
        token0Symbol = pools[poolNumber].token1.symbol
        token1Symbol = pools[poolNumber].token0.symbol
        decimalsIn = pools[poolNumber].token1.decimals
        decimalsOut = pools[poolNumber].token0.decimals
        tokenInName = pools[poolNumber].token1.name
        tokenOutName = pools[poolNumber].token0.name
    }

    // Create a new instance of the Quoter contract
    const quoter2 = new ethers.Contract(
        QUOTER2_CONTRACT_ADDRESS,
        Quoter2Abi,
        provider,
    )

    // Create a params object
    const paramsObj = {
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        fee: fee,
        amountIn: ethers.utils.parseUnits("1", decimalsIn),
        sqrtPriceLimitX96: 0,
    }

    // Call the quoteExactInputSingle function

    const output = await quoter2.callStatic.quoteExactInputSingle(paramsObj)
    const sqrtPriceLimitX96After = output.sqrtPriceX96After

    // Prepare return variables

    const price = sqrtToPrice(
        sqrtPriceLimitX96,
        decimalsIn,
        decimalsOut,
        token0IsInput,
    )
    const priceAfter = sqrtToPrice(
        sqrtPriceLimitX96After,
        decimalsIn,
        decimalsOut,
        token0IsInput,
    )

    const absoluteChange = price - priceAfter
    const percentageChange = absoluteChange / price

    const gasEstimate = output.gasEstimate

    const formattedAmountIn = ethers.utils.formatUnits(1, decimalsIn)
    const formattedAmountOut = ethers.utils.formatUnits(
        output.amountOut.toString(),
        decimalsOut,
    )

    // Log the amount of tokenOut that will be received
    console.log("")
    console.log(`PAIR: ${token0Symbol}/${token1Symbol}`)
    console.log("")
    console.log(
        `Quoted Amount of ${tokenInName} Out for ${formattedAmountIn} ${tokenOutName} :`,
        formattedAmountOut,
    )
    console.log("")
    console.log(`Gas estimate: ${gasEstimate}`)
    console.log("")
    console.log(`Price Before: ${price}`)
    console.log(`Price After:  ${priceAfter}`)
    console.log("")
    console.log("Percent Change: ", (percentageChange * 100).toFixed(3), "%")
    console.log("-------------------------------")
    console.log("")

    return formattedAmountOut, gasEstimate, price, priceAfter
}
async function main(pools) {
    let quote

    for (let i = 0; i < pools.length; i++) {
        quote = quoteV2GraphQuery(
            pools[i].id,
            pools[i].token0.id,
            pools[i].token1.id,
            i,
        )
        console.log("hi")
    }
}

main(pools).catch((error) => {
    console.error(error)
    process.exitCode = 1
})

exports.quoteV2GraphQuery = quoteV2GraphQuery
