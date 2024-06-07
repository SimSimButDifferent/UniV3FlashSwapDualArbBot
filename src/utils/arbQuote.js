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
/**
 * @dev This function checks for arbitrage opportunities in a given route
 * Calls the Quoter contract to get the output of a swap
 * If the route is profitable calls flashswap. Then recursively calls
 * flashswap again until there is no arbitrage opportunity left.
 * @param route
 * @param amountIn
 * @param routeNumber
 * @param profitThreshold
 * @returns {Promise<[amountOut, arbitrageOpportunity, profit, minimumAmountOut]>}
 */
async function arbQuote(route, amountIn, routeNumber, profitThreshold) {
    let arbitrageOpportunity = false
    let poolAddress
    let feePool1
    let tokenIn
    let tokenOut

    const amountInUsd = route[7]

    const token0Decimals = route[5]
    const token1Decimals = route[6]

    console.log("token amount In", amountIn)

    // Create a new provider
    const provider = getProvider()

    // Create a new instance of the Quoter contract
    const quoter2 = new ethers.Contract(quoter2Address, Quoter2Abi, provider)

    // Simulate the swap
    async function simSwap(amountIn) {
        const swapPath = ethers.solidityPacked(
            ["address", "uint24", "address", "uint24", "address"],
            [route[0], route[1], route[2], route[3], route[4]],
        )

        const output = await quoter2.quoteExactInput.staticCall(
            swapPath,
            amountIn,
        )

        // Log neccesary outputs
        const amountOut = output.amountOut
        const gasEstimate = output.gasEstimate.toString()
        // const gasEstimateUsd = ethers.parseUnits(
        //     await gasEstimateToUsd(gasEstimate),
        //     6,
        // )
        const gasEstimateUsd = await gasEstimateToUsd(gasEstimate)
        const gasEstimateUsdBigInt = ethers.parseUnits(gasEstimateUsd, 6)

        // Calculate the minimum amount required to make the trade profitable / worthwhile
        const minimumAmountOut =
            Number(amountInUsd) +
            Number(gasEstimateUsdBigInt) +
            Number(profitThreshold)

        // Calculate the profit
        const profit = Number(amountOut) - minimumAmountOut

        return {
            amountOut,
            gasEstimate,
            gasEstimateUsd,
            minimumAmountOut,
            profit,
            gasEstimateUsdBigInt,
        }
    }

    const {
        amountOut,
        gasEstimate,
        gasEstimateUsd,
        minimumAmountOut,
        profit,
        gasEstimateUsdBigInt,
    } = await simSwap(amountIn)

    console.log("amount in usd: ", amountInUsd, typeof amountInUsd)

    console.log(
        "gas estimate usd Bigint: ",
        gasEstimateUsdBigInt,
        typeof gasEstimateUsdBigInt,
    )
    console.log("profit threshhold", profitThreshold, typeof profitThreshold)
    console.log("gas estimate usd: ", gasEstimateUsd, typeof gasEstimateUsd)

    // Calculate wether the arbitrage opportunity is profitable
    if (profit > profitThreshold) {
        arbitrageOpportunity = true

        // Inputs for calling Flashswap
        poolAddress = route[10]
        feePool1 = route[3]
        tokenIn = route[0]
        tokenOut = route[2]

        const flashSwap = initFlashSwap()

        console.log("")
        console.log(`Arbitrage opportunity found: Route ${routeNumber} `)
        console.log("Executing FlashSwap...")
        console.log("")

        // Call flashswap
        const tx = await flashSwap.flashswap(
            poolAddress,
            feePool1,
            tokenIn,
            tokenOut,
            amountIn,
            minimumAmountOut,
        )

        // Log the smart contract profit of each token
        const wethProfit = ethers.formatUnits(
            await flashSwap.getWethProfit(),
            18,
        )
        const usdcProfit = ethers.formatUnits(
            await flashSwap.getUsdcProfit(),
            6,
        )
        const usdtProfit = ethers.formatUnits(
            await flashSwap.getUsdtProfit(),
            6,
        )

        console.log(`Route ${routeNumber} Info:`)
        console.log(
            `amountIn - ${ethers.utils.formatUnits(amountIn.toString(), token0Decimals)} ${route[9]}`,
        )

        console.log(
            `${route[9]} profit - ${ethers.utils.formatUnits(profit, token0Decimals)}`,
        )
        console.log(
            `Path - ${route[0]} -> ${route[1]} -> ${route[2]} -> ${route[3]} -> ${route[4]}`,
        )
        console.log("-----------------------")
        console.log("")
        console.log("Total Smart Contract Profits:")
        console.log(`WETH Profit: ${wethProfit}`)
        console.log(`USDC Profit: ${usdcProfit}`)
        console.log(`USDT Profit: ${usdtProfit}`)
        console.log("")
        console.log("-----------------------")

        // Get transaction reciept
        const txRecipt = await tx.wait()
        console.log("Transaction Recipt: ", txRecipt)

        // Call arb quote again. Code will loop until no arbitrage opportunity left in route.
        await arbQuote(route, amountIn, routeNumber, profitThreshold)
    } else {
        console.log("")
        console.log("No arbitrage opportunity found in Route: ", routeNumber)
        console.log("")
        console.log("-----------------------")
    }

    return [amountOut, arbitrageOpportunity, profit, minimumAmountOut, route[9]]
}

exports.arbQuote = arbQuote
