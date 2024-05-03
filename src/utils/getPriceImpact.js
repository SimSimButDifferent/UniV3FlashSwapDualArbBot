const { ethers } = require("ethers")
const { getProvider } = require("./getProvider")

// Artifacts
const {
    abi: Quoter2Abi,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")
const {
    abi: FactoryAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json")
require("./getProvider")

const { abi: ERC20_ABI } = require("../../out/IERC20.sol/IERC20.json")

const { weth9Abi: WETH_ABI } = require("../../mainnetTokens.json")

// Contract addresses
const QUOTER2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

// Create a new provider
// const provider = getProvider()

// const getAbi = (address) => (address === WETH_ADDRESS ? WETH_ABI : ERC20_ABI)

function sqrtToPrice(sqrt, decimals0, decimals1, token0IsInput = true) {
    const numerator = sqrt ** 2
    const denominator = 2 ** 192
    let ratio = numerator / denominator
    const shiftDecimals = Math.pow(10, decimals1 - decimals0)
    ratio = ratio * shiftDecimals
    if (!token0IsInput) {
        ratio = 1 / ratio
    }

    return ratio
}

async function getPriceImpact(tokenIn, tokenOut, fee, amountIn) {
    const provider = getProvider()
    const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryAbi, provider)

    const poolAddress = factory.getPool(tokenIn, tokenOut, fee)

    const poolContract = new ethers.Contract(poolAddress, PoolAbi, provider)

    const slot0 = await poolContract.slot0()
    const sqrtPriceLimitX96 = slot0.sqrtPriceX96

    const token0 = await poolContract.token0()
    const token1 = await poolContract.token1()

    const token0IsInput = token0 === tokenIn

    // const tokenInAbi = getAbi(tokenIn)
    // const tokenOutAbi = getAbi(tokenOut)

    const tokenInContract = new ethers.Contract(tokenIn, tokenInAbi, provider)
    const tokenOutContract = new ethers.Contract(
        tokenOut,
        tokenOutAbi,
        provider,
    )

    const decimalsIn = await tokenInContract.decimals()
    const decimalsOut = await tokenOutContract.decimals()

    const quoterV2 = new ethers.Contract(QUOTER2_ADDRESS, Quoter2Abi, provider)

    const params = {
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        fee: fee,
        amountIn: amountIn,
        sqrtPriceLimitX96: "0",
    }

    const quote = await quoterV2.quoteExactInputSingle(params)
    const sqrt = quote.sqrtPriceLimitX96After

    const sqrtPriceLimitX96After = sqrtToPrice(
        sqrt,
        decimalsIn,
        decimalsOut,
        token0IsInput,
    )

    console.log(sqrtPriceLimitX96After)
}

getPriceImpact(WETH_ADDRESS, USDC_ADDRESS, 3000, amountIn).catch((error) => {
    console.error("Error calling getPriceImpact:", error)
    process.exitCode = 1
})
