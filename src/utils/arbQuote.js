const { ethers } = require("hardhat")
const { FeeAmount } = require("@uniswap/v3-sdk")
const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const { getProvider } = require("./getProvider.js")
const { sqrtToPrice } = require("./utilities.js")
const {
    USDT_TOKEN,
    USDC_TOKEN,
    QUOTER2_CONTRACT_ADDRESS,
} = require("./constants.js")

async function arbQuote(path, fees, amountIn) {
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
        [path[0], fees[0], path[1], fees[1], path[2]],
    )

    // Call the quoteExactInput function and get the output

    const output = await quoter2.callStatic.quoteExactInput(swapPath, amountIn)

    console.log(
        `amountOut - ${ethers.utils.formatUnits(output.amountOut.toString(), 6)}`,
    )
    console.log(`gas estimate - ${output.gasEstimate.toString()}`)
}

arbQuote(
    [USDT_TOKEN.address, USDC_TOKEN.address, USDT_TOKEN.address],
    [FeeAmount.LOW, FeeAmount.MEDIUM],
    ethers.utils.parseUnits("1000", 6),
).catch((error) => {
    console.error(error)
    process.exitCode = 1
})

exports.arbQuote = arbQuote
