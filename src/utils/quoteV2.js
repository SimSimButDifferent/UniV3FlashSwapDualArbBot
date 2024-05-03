const { ethers } = require("hardhat")
const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")
const {
    abi: FactoryAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json")
const { getProvider } = require("./getProvider")
const { sqrtToPrice } = require("./utilities")
const { CurrentConfig } = require("../../config")

// Quoter Address

const QUOTER2_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984"

/**
 * @dev Params configured in config.js file.
 * @param {
 * in: tokenIn,
 * out: tokenOut,
 * poolFee: fee,
 * amountIn: amountIn}
 * @returns {Promise<void>}
 * @description Quote the amount of tokenOut that will be received for the amountIn of tokenIn
 */
async function quoteV2(params) {
    // Create a new provider
    const provider = getProvider()

    // Create a new instance of the Factory contract
    const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryAbi, provider)

    const tokenIn = params.in.address
    const tokenOut = params.out.address
    const fee = params.poolFee

    const poolAddress = factory.getPool(tokenIn, tokenOut, fee)

    const poolContract = new ethers.Contract(poolAddress, PoolAbi, provider)

    const slot0 = await poolContract.slot0()
    const sqrtPriceLimitX96 = slot0.sqrtPriceX96

    const token0 = await poolContract.token0()
    const token1 = await poolContract.token1()

    const token0IsInput = token0 === tokenIn

    let token0Symbol
    let token1Symbol

    if (token0 === tokenIn) {
        token0Symbol = params.in.symbol
        token1Symbol = params.out.symbol
    } else {
        token0Symbol = params.out.symbol
        token1Symbol = params.in.symbol
    }

    const decimalsIn = params.in.decimals
    const decimalsOut = params.out.decimals

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
        amountIn: params.amountIn,
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

    const formattedAmountIn = ethers.utils.formatUnits(
        params.amountIn.toString(),
        params.in.decimals,
    )
    const formattedAmountOut = ethers.utils.formatUnits(
        output.amountOut.toString(),
        params.out.decimals,
    )

    // Log the amount of tokenOut that will be received
    console.log("")
    console.log(`PAIR: ${token0Symbol}/${token1Symbol}`)
    console.log("")
    console.log(
        `Quoted Amount of ${params.in.name} Out for ${formattedAmountIn} ${params.out.name} :`,
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

quoteV2(CurrentConfig.WETHUSDC).catch((error) => {
    console.error("Error in main function:", error)
    process.exitCode = 1
})
quoteV2(CurrentConfig.USDTUSDC)

quoteV2(CurrentConfig.WBTCUSDT)

// quoteV2(CurrentConfig.LINKUSDT)

// quoteV2(CurrentConfig.UNIUSDT)

// quoteV2(CurrentConfig.AAVEUSDC)

// quoteV2(CurrentConfig.CRVUSDT)

// quoteV2(CurrentConfig.USDTAAVE)

exports.quoteV2 = quoteV2
