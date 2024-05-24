const { ethers, network } = require("hardhat")
const { networkConfig } = require("../../helper-hardhat-config.js")

const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")

const { getProvider } = require("./getProvider.js")
const { gasEstimateToUsd } = require("./utilities")
const { initFlashSwap } = require("./initFlashSwap")

const chainId = network.config.chainId
const quoter2Address = networkConfig[chainId].quoter2

async function arbQuote(route, amountIn, routeNumber, profitThreshold) {
    let arbitrageOpportunity = false
    let poolAddress
    let feePool1
    let tokenIn
    let tokenOut

    const token0Decimals = route[5]
    const token1Decimals = route[6]

    // Create a new provider
    const provider = getProvider()

    // Create a new instance of the Quoter contract
    const quoter2 = new ethers.Contract(quoter2Address, Quoter2Abi, provider)

    async function simSwap(amountIn) {
        const swapPath = ethers.utils.solidityPack(
            ["address", "uint24", "address", "uint24", "address"],
            [route[0], route[1], route[2], route[3], route[4]],
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
            6,
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
        poolAddress = route[10]
        feePool1 = route[3]
        tokenIn = route[0]
        tokenOut = route[2]

        const flashSwap = initFlashSwap()

        console.log("")
        console.log(`Arbitrage opportunity found: Route ${routeNumber} `)
        console.log("")
        console.log("")
        console.log(`Route ${routeNumber} Info:`)
        console.log(
            `amountIn - ${ethers.utils.formatUnits(amountIn.toString(), token0Decimals)} ${route[9]}`,
        )
        console.log(
            `amountOut - ${ethers.utils.formatUnits(amountOut.toString(), token0Decimals)} ${route[9]}`,
        )
        console.log(
            `MinimumAmountOut: ${ethers.utils.formatUnits(minimumAmountOut, token0Decimals)}`,
        )
        console.log(
            `profit - ${ethers.utils.formatUnits(profit, token0Decimals)}`,
        )
        console.log(
            `Path - ${route[0]} -> ${route[1]} -> ${route[2]} -> ${route[3]} -> ${route[4]}`,
        )
        console.log("")
        console.log("-----------------------")

        const tx = await flashSwap.flashswap(
            poolAddress,
            feePool1,
            tokenIn,
            tokenOut,
            amountIn,
            minimumAmountOut,
        )
        const txRecipt = await tx.wait()
        console.log("Transaction Recipt: ", txRecipt)
    } else {
        console.log("")
        console.log("No arbitrage opportunity found in Route: ", routeNumber)
        console.log("")
        console.log("-----------------------")
    }

    return [amountOut, arbitrageOpportunity, profit, minimumAmountOut]
}

exports.arbQuote = arbQuote
