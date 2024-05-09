const { ethers } = require("hardhat")
const { FeeAmount } = require("@uniswap/v3-sdk")
const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")
const { data } = require("./jsonPoolData/uniswapStablecoinPools.json")
const constants = require("./constants.js")

const { getProvider } = require("./getProvider.js")
const { sqrtToPrice } = require("./utilities.js")
const {
    USDT_TOKEN,
    USDC_TOKEN,
    QUOTER_CONTRACT_ADDRESS,
    SWAP_ROUTER_02_ADDRESS,
} = require("./constants.js")
const pools = data.pools

// Create a new provider
const provider = getProvider()

// Create a new instance of the Quoter contract
const quoter2 = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter2Abi,
    provider,
)

async function arbQuote(path, fees, amountIn) {
    const MultiHop = ethers.getContractFactory("MultiHop")
    const multiHop = await MultiHop.deploy(SWAP_ROUTER_02_ADDRESS)
    await multiHop.deployed()
    const swapPath = [path[0], fees[0], path[1], fees[1], path[2]]

    // Call the quoteExactInput function and get the output
    try {
        const output = await quoter2.callStatic.quoteExactInput(
            swapPath,
            amountIn,
        )
        console.log(`Amount out: ${output.toString()}`)
    } catch (error) {
        console.error(`Error fetching quote: ${error}`)
        if (error.data) {
            console.error(`Revert reason: ${error.data.message}`)
        }
    }
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
