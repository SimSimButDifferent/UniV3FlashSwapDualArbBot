const { ethers } = require("hardhat")

const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")

const { getProvider } = require("./getProvider.js")

const QUOTER2_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

async function arbQuote(path, amountIn) {
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

    const amountOut = output.amountOut.toString()

    const gasEstimate = output.gasEstimate.toString()

    console.log("")
    console.log("-----------------------")
    console.log(
        `amountIn - ${ethers.utils.formatUnits(amountIn.toString(), 6)}`,
    )
    console.log(
        `amountOut - ${ethers.utils.formatUnits(output.amountOut.toString(), 6)}`,
    )
    console.log(`gas estimate - ${output.gasEstimate.toString()}`)
    console.log(`Path - ${path}`)
    console.log("-----------------------")

    return [amountOut, gasEstimate]
}

exports.arbQuote = arbQuote
