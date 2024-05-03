const { ethers } = require("hardhat")
const {
    abi: QuoterAbi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json")
const { getProvider } = require("./getProvider")
const { CurrentConfig } = require("../../config")

// Quoter Address

const QUOTER_CONTRACT_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"

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
async function quoteV1(params) {
    // Create a new provider
    const provider = getProvider()

    // Create a new instance of the Quoter contract
    const quoter = new ethers.Contract(
        QUOTER_CONTRACT_ADDRESS,
        QuoterAbi,
        provider,
    )

    // Get the params from the config file
    const tokenIn = params.in.address
    const tokenOut = params.out.address
    const fee = params.poolFee
    const amountIn = params.amountIn
    const sqrtPriceLimitX96 = 0

    // Call the quoteExactInputSingle function
    try {
        const amountOut = await quoter.callStatic.quoteExactInputSingle(
            tokenIn,
            tokenOut,
            fee,
            amountIn,
            sqrtPriceLimitX96,
        )

        // Log the amount of tokenOut that will be received
        console.log(
            `Quoted Amount Out for ${params.in.name} :`,
            ethers.utils.formatUnits(amountOut, 6),
        )

        return ethers.utils.formatUnits(amountOut, 6)
    } catch (error) {
        console.error("Error calling quoteExactInputSingle:", error)
    }
}

quoteV1(CurrentConfig.WETHUSDC).catch((error) => {
    console.error("Error in main function:", error)
    process.exitCode = 1
})
quoteV1(CurrentConfig.USDTUSDC)

quoteV1(CurrentConfig.WBTCUSDT)

quoteV1(CurrentConfig.LINKUSDT)

quoteV1(CurrentConfig.UNIUSDT)

quoteV1(CurrentConfig.AAVEUSDC)

quoteV1(CurrentConfig.CRVUSDT)

exports.quoteV1 = quoteV1
