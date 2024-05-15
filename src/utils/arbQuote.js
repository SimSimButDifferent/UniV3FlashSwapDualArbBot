const { ethers } = require("hardhat")

const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")

const { getProvider } = require("./getProvider.js")
const { gasEstimateToUsd } = require("./utilities")

const QUOTER2_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

const tokenDecimals = 6

async function arbQuote(path, amountIn, routeNumber, profitThreshold) {
    let arbitrageOpportunity = false

    // Create a new provider
    const provider = getProvider()

    // Create a new instance of the Quoter contract
    const quoter2 = new ethers.Contract(
        QUOTER2_CONTRACT_ADDRESS,
        Quoter2Abi,
        provider,
    )

    const swapPath = ethers.utils.solidityPack(
        ["address", "uint24", "address", "uint24", "address"],
        [path[0], path[1], path[2], path[3], path[4]],
    )

    // Call the quoteExactInput function and get the output

    const output = await quoter2.callStatic.quoteExactInput(swapPath, amountIn)

    const amountOut = output.amountOut

    const gasEstimate = output.gasEstimate.toString()

    const gasEstimateUsd = ethers.utils.parseUnits(
        await gasEstimateToUsd(gasEstimate),
        tokenDecimals,
    )

    const sqrtPriceX96AfterList = output.sqrtPriceX96AfterList.toString()

    const initializedTicksCrossedList =
        output.initializedTicksCrossedList.toString()

    // Calculate the minimum amount required to make the trade profitable / worthwhile
    const minimumAmountOut =
        Number(amountIn) + Number(gasEstimateUsd) + Number(profitThreshold)

    // Calculate wether the arbitrage opportunity is profitable
    if (Number(amountOut) > minimumAmountOut) {
        arbitrageOpportunity = true

        console.log("")
        console.log(
            "Arbitrage opportunity found, executing trade route: ",
            routeNumber,
        )
        console.log("")
    } else {
        console.log("")
        console.log("No arbitrage opportunity found in Route: ", routeNumber)
        console.log("")
        console.log("-----------------------")
    }

    console.log("")
    console.log(`Route: ${routeNumber}`)
    console.log(
        `amountIn - ${ethers.utils.formatUnits(amountIn.toString(), tokenDecimals)}`,
    )
    console.log(
        `amountOut - ${ethers.utils.formatUnits(output.amountOut.toString(), tokenDecimals)}`,
    )
    console.log(
        `MinimumAmountOut: ${ethers.utils.formatUnits(minimumAmountOut, tokenDecimals)}`,
    )
    console.log(`gas estimate - ${output.gasEstimate.toString()}`)
    console.log(
        `gas estimate in USD - ${ethers.utils.formatUnits(gasEstimateUsd, tokenDecimals)}`,
    )
    // console.log(`sqrtPriceX96AfterList - ${sqrtPriceX96AfterList}`)
    // console.log(`initializedTicksCrossed - ${initializedTicksCrossedList}`)
    console.log(`Path - ${path}`)
    console.log("")
    console.log("-----------------------")

    return [
        amountIn,
        amountOut,
        gasEstimate,
        gasEstimateUsd,
        arbitrageOpportunity,
        minimumAmountOut,
        sqrtPriceX96AfterList,
        initializedTicksCrossedList,
    ]
}

exports.arbQuote = arbQuote
