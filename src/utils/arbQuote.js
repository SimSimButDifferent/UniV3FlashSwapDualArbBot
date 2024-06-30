const { ethers } = require("hardhat")
const {
    abi: flashSwapAbi,
} = require("../../ignition/deployments/chain-31337/artifacts/FlashSwapV3#FlashSwapV3.json")
const { getProvider } = require("./getProvider.js")

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
async function arbQuote(route, routeNumber) {
    let arbitrageOpportunity
    let poolAddress
    let feePool1
    let tokenIn
    let tokenOut

    const amountInFlash = route[11]
    const profitThresholdToken = route[8]
    const minimumAmountOut = amountInFlash + profitThresholdToken

    const provider = getProvider()
    const owner = new ethers.Wallet(BOT_PRIVATE_KEY, provider)

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

    console.log("")
    console.log(`Calling Flashswap: Route ${routeNumber} `)
    console.log("")

    // Validate inputs
    if (!ethers.isAddress(poolAddress)) throw new Error("Invalid pool address")

    if (!ethers.isAddress(tokenIn)) throw new Error("Invalid tokenIn address")
    if (!ethers.isAddress(tokenOut)) throw new Error("Invalid tokenOut address")

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

    console.log(`Route ${routeNumber} Info:`)
    console.log(
        `amountIn - ${ethers.formatUnits(amountInFlash, Number(route[6]))} ${route[9]}`,
    )

    console.log(
        `Path - ${route[0]} -> ${route[1]} -> ${route[2]} -> ${route[3]} -> ${route[4]}`,
    )

    return [arbitrageOpportunity, minimumAmountOut]
}

exports.arbQuote = arbQuote
