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
 * @param routeNumber
 * @returns {Promise<[amountOut, arbitrageOpportunity, profit, minimumAmountOut]>}
 */
async function arbQuote(route, routeNumber, amountInUsd) {
    let arbitrageOpportunity
    let poolAddress
    let feePool1
    let tokenIn
    let tokenOut

    const amountInSim = route[7]
    const amountInFlash = route[11]
    const amountInUsdBigInt = BigInt(amountInUsd)
    const profitThresholdToken = route[8]
    const profitThresholdUsd = amountInUsdBigInt / 100n

    const token0Decimals = route[5]
    const token1Decimals = route[6]

    // console.log("token amount In", amountIn)

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

        try {
            const output = await quoter2.quoteExactInput.staticCall(
                swapPath,
                amountIn,
            )

            // Log necessary outputs
            const amountOut = output.amountOut
            const gasEstimate = output.gasEstimate.toString()
            // const gasEstimateUsd = ethers.parseUnits(
            //     await gasEstimateToUsd(gasEstimate),
            //     6,
            // )
            const gasEstimateUsd = await gasEstimateToUsd(gasEstimate)
            const gasEstimateUsdBigInt = ethers.parseUnits(gasEstimateUsd, 6)

            // Calculate the minimum amount required to make the trade profitable / worthwhile
            // const minimumAmountOut =
            //     amountInSim + gasEstimateUsdBigInt + profitThresholdUsd
            const minimumAmountOut = amountInSim + profitThresholdToken
            // Calculate the profit
            const profit = amountOut - minimumAmountOut

            return {
                amountOut,
                minimumAmountOut,
                profit,
            }
        } catch (error) {
            console.error("Error during quoteExactInput.staticCall:", error)
            console.log("")
            console.log("-----------------------------")
            console.log("")
            console.log(`Bad Route - route number ${routeNumber}`)
            console.log(route)
            console.log("")
            console.log("-----------------------------")
            console.log("")

            return {
                amountOut: 0n,
                minimumAmountOut: 0n,
                profit: 0n,
            }
        }
    }

    const { amountOut, minimumAmountOut, profit } = await simSwap(amountInSim)

    console.log("SimSwap complete")

    // Calculate wether the arbitrage opportunity is profitable
    if (profit > profitThresholdToken) {
        arbitrageOpportunity = true

        // Inputs for calling Flashswap
        poolAddress = ethers.getAddress(route[10])
        feePool1 = route[3]
        tokenIn = route[0]
        tokenOut = route[2]

        const flashSwap = initFlashSwap()

        console.log("")
        console.log(`Arbitrage opportunity found: Route ${routeNumber} `)
        console.log("Executing FlashSwap...")
        console.log("")

        // Validate inputs
        if (!ethers.utils.isAddress(poolAddress))
            throw new Error("Invalid pool address")
        if (typeof feePool1 !== "number") throw new Error("Invalid fee")
        if (!ethers.utils.isAddress(tokenIn))
            throw new Error("Invalid tokenIn address")
        if (!ethers.utils.isAddress(tokenOut))
            throw new Error("Invalid tokenOut address")
        if (!ethers.BigNumber.isBigNumber(amountIn))
            throw new Error("Invalid amountIn")
        if (!ethers.BigNumber.isBigNumber(minimumAmountOut))
            throw new Error("Invalid minimumAmountOut")

        try {
            // Call flashswap
            const tx = await flashSwap.flashSwap(
                poolAddress,
                feePool1,
                tokenIn,
                tokenOut,
                amountInFlash,
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
                `amountIn - ${ethers.formatUnits(amountInFlash, token1Decimals)} ${route[9]}`,
            )

            console.log(
                `${route[9]} profit - ${ethers.formatUnits(profit, token0Decimals)}`,
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

            // Get transaction receipt
            const txReceipt = await tx.wait()
            console.log("Transaction Receipt: ", txReceipt)

            // Call arb quote again. Code will loop until no arbitrage opportunity left in route.
            await arbQuote(route, amountIn, routeNumber)
        } catch (error) {
            console.error("Error executing flashswap:", error)
        }
    } else {
        const formattedProfit = ethers.formatUnits(
            profit,
            Number(token0Decimals),
        )
        console.log("")
        console.log("No arbitrage opportunity found in Route: ", routeNumber)
        console.log("Amount In: ", amountInSim)
        console.log("Amount Out: ", amountOut)
        console.log("Minimum Amount Out: ", minimumAmountOut)

        console.log(`Profit: ${formattedProfit} - ${route[9]}`)
        console.log("")
        console.log("-----------------------")
        arbitrageOpportunity = false
    }

    return [amountOut, arbitrageOpportunity, profit, minimumAmountOut]
}

exports.arbQuote = arbQuote
