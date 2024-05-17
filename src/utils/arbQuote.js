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
    let optimalAmountIn = amountIn
    let maxProfit = 0

    // Create a new provider
    const provider = getProvider()

    // Create a new instance of the Quoter contract
    const quoter2 = new ethers.Contract(
        QUOTER2_CONTRACT_ADDRESS,
        Quoter2Abi,
        provider,
    )

    async function simSwap(amountIn) {
        const swapPath = ethers.utils.solidityPack(
            ["address", "uint24", "address", "uint24", "address"],
            [path[0], path[1], path[2], path[3], path[4]],
        )

        // Call the quoteExactInput function and get the output

        const output = await quoter2.callStatic.quoteExactInput(
            swapPath,
            amountIn,
        )
        const amountOut = output.amountOut
        const gasEstimate = output.gasEstimate.toString()
        const gasEstimateUsd = ethers.utils.parseUnits(
            await gasEstimateToUsd(gasEstimate),
            tokenDecimals,
        )

        // Calculate the minimum amount required to make the trade profitable / worthwhile
        const minimumAmountOut =
            Number(amountIn) + Number(gasEstimateUsd) + Number(profitThreshold)

        const profit = Number(amountOut) - minimumAmountOut

        return {
            amountOut,
            gasEstimate,
            gasEstimateUsd,
            minimumAmountOut,
            profit,
        }
    }

    const { amountOut, gasEstimate, gasEstimateUsd, minimumAmountOut, profit } =
        await simSwap(amountIn)

    // Calculate wether the arbitrage opportunity is profitable
    if (profit > profitThreshold) {
        arbitrageOpportunity = true

        console.log("")
        console.log(
            `Arbitrage opportunity found: Route ${routeNumber}, calculating optimal amountIn... `,
        )
        console.log("")
        console.log("")
        console.log(`Route ${routeNumber} Info:`)
        console.log(
            `amountIn - ${ethers.utils.formatUnits(amountIn.toString(), tokenDecimals)}`,
        )
        console.log(
            `amountOut - ${ethers.utils.formatUnits(amountOut.toString(), tokenDecimals)}`,
        )
        console.log(
            `MinimumAmountOut: ${ethers.utils.formatUnits(minimumAmountOut, tokenDecimals)}`,
        )
        console.log(
            `profit - ${ethers.utils.formatUnits(profit, tokenDecimals)}`,
        )
        console.log(`Path - ${path}`)
        console.log("")
        console.log("-----------------------")

        // await flashSwap(amountIn, path, routeNumber, amountOut, gasEstimate, gasEstimateUsd, sqrtPriceX96AfterList, initializedTicksCrossedList)
    }
    // else {
    //     console.log("")
    //     console.log("No arbitrage opportunity found in Route: ", routeNumber)
    //     console.log("")
    //     console.log("-----------------------")
    // }

    return [amountOut, arbitrageOpportunity, profit, minimumAmountOut]
}

exports.arbQuote = arbQuote
