const { ethers } = require("hardhat")

const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
const {
    abi: flashSwapAbi,
} = require("../../ignition/deployments/chain-31337/artifacts/FlashSwapV3#FlashSwapV3.json")
const { getProvider } = require("./getProvider.js")

const { getGasPrice } = require("./getGasPrice")

const quoter2Address = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"
const FLASHSWAP_CONTRACT_ADDRESS = "0xf812197DbdbcD0f80cD003C20f695dc8d06bC3b0" // Arbitrum
// const FLASHSWAP_CONTRACT_ADDRESS = "0xc5b7205454Ef2e4DDe093442bC1b1457E46B0352" // localhost
const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY

/**
 * @dev This function checks for arbitrage opportunities in a given route
 * Calls the Quoter contract to get the output of a swap
 * If the route is profitable calls flashswap. Then recursively calls
 * flashswap again until there is no arbitrage opportunity left.
 * @param route
 * @param routeNumber
 * @returns {Promise<[amountOut, arbitrageSuccess, profit, minimumAmountOut]>}
 */
async function arbQuote(route, routeNumber, amountInUsd) {
    let arbitrageSuccess
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
    const owner = new ethers.Wallet(BOT_PRIVATE_KEY, provider)

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

            // Calculate the minimum amount required to make the trade profitable / worthwhile
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

    // Calculate wether the arbitrage opportunity is profitable
    if (profit > profitThresholdToken) {
        // Inputs for calling Flashswap
        poolAddress = ethers.getAddress(route[10])
        feePool1 = route[3]
        tokenIn = route[0]
        tokenOut = route[2]

        const flashSwap = new ethers.Contract(
            FLASHSWAP_CONTRACT_ADDRESS,
            flashSwapAbi,
            provider,
        )

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

        const gasPrice = await getGasPrice()
        const gasLimit = 2000000n

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
                    {
                        gasPrice: gasPrice,
                        gasLimit: gasLimit,
                        // maxPriorityFeePerGas: gasPrice,
                    },
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
                arbitrageSuccess = true
            }
            console.log("")
            console.log("Validating inputs for recursive call of arbQuote:")
            console.log("Route: ", route)
            console.log("Amount In: ", amountInUsd)
            console.log("Route Number: ", routeNumber)
            console.log("")
            // Call arb quote again. Code will loop until no arbitrage opportunity left in route.
            await arbQuote(route, amountInUsd, routeNumber)
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

        console.log(
            "Minimum Amount Out: ",
            ethers.formatUnits(minimumAmountOut, Number(token0Decimals)),
        )

        console.log(`Profit: ${formattedProfit} - ${route[9]}`)
        console.log("")
        console.log("-----------------------")
        arbitrageSuccess = false
    }

    return [amountOut, arbitrageSuccess, profit, minimumAmountOut]
}

exports.arbQuote = arbQuote
