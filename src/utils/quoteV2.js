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
async function quoteV2(params, tokenIn) {
    // Create a new provider
    const provider = getProvider()

    // Create a new instance of the Factory contract
    const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryAbi, provider)

    const token0Address = params.token0.address
    const token1Address = params.token1.address
    const fee = params.poolFee

    const poolAddress = factory.getPool(token0Address, token1Address, fee)

    const poolContract = new ethers.Contract(poolAddress, PoolAbi, provider)

    const slot0 = await poolContract.slot0()
    const sqrtPriceLimitX96 = slot0.sqrtPriceX96

    const token0 = await poolContract.token0()
    const token1 = await poolContract.token1()

    const token0IsInput = token0 === tokenIn

    const token0Symbol = params.token0.symbol
    const token1Symbol = params.token1.symbol

    const decimalsT0 = params.token0.decimals
    const decimalsT1 = params.token1.decimals

    // Create a new instance of the Quoter contract
    const quoter2 = new ethers.Contract(
        QUOTER2_CONTRACT_ADDRESS,
        Quoter2Abi,
        provider,
    )

    // Create a params object
    const paramsObj = {
        tokenIn: token0Address,
        tokenOut: token1Address,
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
        decimalsT0,
        decimalsT1,
        token0IsInput,
    )
    const priceAfter = sqrtToPrice(
        sqrtPriceLimitX96After,
        decimalsT0,
        decimalsT1,
        token0IsInput,
    )

    const absoluteChange = price - priceAfter
    const percentageChange = absoluteChange / price

    const gasEstimate = output.gasEstimate

    const formattedAmountIn = ethers.utils.formatUnits(
        params.amountIn.toString(),
        params.token0.decimals,
    )
    const formattedAmountOut = ethers.utils.formatUnits(
        output.amountOut.toString(),
        params.token1.decimals,
    )

    // Log the amount of tokenOut that will be received
    console.log("")
    console.log(`PAIR: ${token0Symbol}/${token1Symbol} - FEE: ${fee}`)
    console.log("")
    console.log(
        `Quoted Amount of ${params.token0.name} Out for ${formattedAmountIn} ${params.token1.name} :`,
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

quoteV2(CurrentConfig.USDCUSDT100, CurrentConfig.USDCUSDT100.token0.address)
quoteV2(CurrentConfig.USDCUSDT100, CurrentConfig.USDCUSDT100.token1.address)

quoteV2(CurrentConfig.USDCUSDT500, CurrentConfig.USDCUSDT500.token0.address)

quoteV2(CurrentConfig.USDCUSDT3000, CurrentConfig.USDCUSDT3000.token0.address)

// quoteV2(CurrentConfig.USDCUSDT3000).catch((error) => {
//     console.error("Error in main function:", error)
//     process.exitCode = 1
// })

// quoteV2(CurrentConfig.LINKUSDT)

// quoteV2(CurrentConfig.UNIUSDT)

// quoteV2(CurrentConfig.AAVEUSDC)

// quoteV2(CurrentConfig.CRVUSDT)

// quoteV2(CurrentConfig.USDTAAVE)

exports.quoteV2 = quoteV2
