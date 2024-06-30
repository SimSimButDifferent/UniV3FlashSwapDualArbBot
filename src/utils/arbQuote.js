const { ethers, network } = require("hardhat")
const { networkConfig } = require("../../helper-hardhat-config.js")
const { networks } = require("../../hardhat.config.js")

// const {
//     abi: Quoter2Abi,
// } = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
const {
    abi: flashSwapAbi,
} = require("../../ignition/deployments/chain-31337/artifacts/FlashSwapV3#FlashSwapV3.json")
const { getProvider } = require("./getProvider.js")
// const { gasEstimateToUsd } = require("./utilities")
const { initFlashSwap } = require("./initFlashSwap")

const chainId = network.config.chainId
const quoter2Address = networkConfig[chainId].quoter2
const FLASHSWAP_CONTRACT_ADDRESS = "0xf812197DbdbcD0f80cD003C20f695dc8d06bC3b0"

const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY

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

    // const amountInSim = route[7]
    const amountInFlash = route[11]
    const profitThresholdToken = route[8]
    const minimumAmountOut = amountInFlash + profitThresholdToken

    const provider = getProvider()
    const owner = new ethers.Wallet(BOT_PRIVATE_KEY, provider)

    // const owner = ethers.getSigner()

    // const amountInUsdBigInt = BigInt(amountInUsd)
    // const profitThresholdToken = route[8]
    // const profitThresholdUsd = amountInUsdBigInt / 100n

    const token0Decimals = route[5]
    const token1Decimals = route[6]

    // console.log("token amount In", amountIn)

    // Create a new provider

    // // Create a new instance of the Quoter contract
    // const quoter2 = new ethers.Contract(quoter2Address, Quoter2Abi, provider)

    // // Simulate the swap
    // async function simSwap(amountIn) {
    //     const swapPath = ethers.solidityPacked(
    //         ["address", "uint24", "address", "uint24", "address"],
    //         [route[0], route[1], route[2], route[3], route[4]],
    //     )

    //     try {
    //         const output = await quoter2.quoteExactInput.staticCall(
    //             swapPath,
    //             amountIn,
    //         )

    //         // Log necessary outputs
    //         const amountOut = output.amountOut
    //         const gasEstimate = output.gasEstimate.toString()
    //         // const gasEstimateUsd = ethers.parseUnits(
    //         //     await gasEstimateToUsd(gasEstimate),
    //         //     6,
    //         // )
    //         // const gasEstimateUsd = await gasEstimateToUsd(gasEstimate)
    //         // const gasEstimateUsdBigInt = ethers.parseUnits(gasEstimateUsd, 6)

    //         // Calculate the minimum amount required to make the trade profitable / worthwhile
    //         // const minimumAmountOut =
    //         //     amountInSim + gasEstimateUsdBigInt + profitThresholdUsd
    //         const minimumAmountOut = amountInSim + profitThresholdToken
    //         // Calculate the profit
    //         const profit = amountOut - minimumAmountOut

    //         return {
    //             amountOut,
    //             minimumAmountOut,
    //             profit,
    //         }
    //     } catch (error) {
    //         console.error("Error during quoteExactInput.staticCall:", error)
    //         console.log("")
    //         console.log("-----------------------------")
    //         console.log("")
    //         console.log(`Bad Route - route number ${routeNumber}`)
    //         console.log(route)
    //         console.log("")
    //         console.log("-----------------------------")
    //         console.log("")

    //         return {
    //             amountOut: 0n,
    //             minimumAmountOut: 0n,
    //             profit: 0n,
    //         }
    //     }
    // }

    // const { amountOut, minimumAmountOut, profit } = await simSwap(amountInSim)

    // console.log("SimSwap complete")

    // // Calculate wether the arbitrage opportunity is profitable
    // if (profit > profitThresholdToken) {
    //     arbitrageOpportunity = true

    // Inputs for calling Flashswap
    poolAddress = ethers.getAddress(route[10])
    feePool1 = route[3]
    tokenIn = route[0]
    tokenOut = route[2]

    // const flashSwap = initFlashSwap()

    const flashSwap = new ethers.Contract(
        FLASHSWAP_CONTRACT_ADDRESS,
        flashSwapAbi,
        provider,
    )

    // console.log("")
    // console.log(`Arbitrage opportunity found: Route ${routeNumber} `)
    // console.log("Executing FlashSwap...")
    // console.log("")

    // Validate inputs
    if (!ethers.isAddress(poolAddress)) throw new Error("Invalid pool address")

    if (!ethers.isAddress(tokenIn)) throw new Error("Invalid tokenIn address")
    if (!ethers.isAddress(tokenOut)) throw new Error("Invalid tokenOut address")
    // if (!ethers.isBigNumber(amountInFlash)) throw new Error("Invalid amountIn")
    // if (!ethers.isBigNumber(minimumAmountOut))
    //     throw new Error("Invalid minimumAmountOut")

    try {
        // Call flashswap
        const tx = await flashSwap
            .connect(owner)
            .flashSwap(
                poolAddress,
                feePool1,
                tokenIn,
                tokenOut,
                amountInFlash,
                minimumAmountOut,
            )

        // Wait for the transaction to be mined
        const receipt = await tx.wait()

        console.log("Transaction successful!")
        console.log("Transaction hash:", tx.hash)
        console.log("Gas used:", receipt.gasUsed.toString())

        // Check for events
        const flashSwapExecutedEvent = receipt.events.find(
            (event) => event.event === "FlashSwapExecuted",
        )

        if (flashSwapExecutedEvent) {
            console.log("FlashSwapExecuted event emitted")
            // You can access event parameters here if needed
        }
    } catch (error) {
        console.error("Error executing flashswap:", error)
    }
    // // Log the smart contract profit of each token
    // const wethProfit = ethers.formatUnits(await flashSwap.getWethProfit(), 18)
    // const usdcProfit = ethers.formatUnits(await flashSwap.getUsdcProfit(), 6)
    // const usdtProfit = ethers.formatUnits(await flashSwap.getUsdtProfit(), 6)

    // if (tokenOut === "WETH") {
    //     const wethProfit = ethers.formatUnits(
    //         await flashSwap.getWethProfit(),
    //         18,
    //     )
    //     console.log(`WETH Profit: ${wethProfit}`)
    // } else if (tokenOut === "USDC") {
    //     const usdcProfit = ethers.formatUnits(
    //         await flashSwap.getUsdcProfit(),
    //         6,
    //     )
    //     console.log(`USDC Profit: ${usdcProfit}`)
    // } else if (tokenOut === "USDT") {
    //     const usdtProfit = ethers.formatUnits(
    //         await flashSwap.getUsdtProfit(),
    //         6,
    //     )
    //     console.log(`USDT Profit: ${usdtProfit}`)
    // }

    console.log(`Route ${routeNumber} Info:`)
    console.log(
        `amountIn - ${ethers.formatUnits(amountInFlash, Number(token1Decimals))} ${route[9]}`,
    )

    console.log(
        `Path - ${route[0]} -> ${route[1]} -> ${route[2]} -> ${route[3]} -> ${route[4]}`,
    )
    // console.log("-----------------------")
    // console.log("")
    // console.log("Total Smart Contract Profits:")
    // console.log(`WETH Profit: ${wethProfit}`)
    // console.log(`USDC Profit: ${usdcProfit}`)
    // console.log(`USDT Profit: ${usdtProfit}`)
    // console.log("")
    // console.log("-----------------------")

    // } else {
    //     const formattedProfit = ethers.formatUnits(
    //         profit,
    //         Number(token0Decimals),
    //     )
    //     console.log("")
    //     console.log("No arbitrage opportunity found in Route: ", routeNumber)
    //     console.log("Amount In: ", amountInSim)
    //     console.log("Amount Out: ", amountOut)
    //     console.log("Minimum Amount Out: ", minimumAmountOut)

    //     console.log(`Profit: ${formattedProfit} - ${route[9]}`)
    //     console.log("")
    //     console.log("-----------------------")
    //     arbitrageOpportunity = false
    // }

    return [
        // amountOut,
        arbitrageOpportunity,
        // profit,
        minimumAmountOut,
    ]
}

exports.arbQuote = arbQuote
