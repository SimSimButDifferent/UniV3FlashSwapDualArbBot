const hre = require("hardhat")
const { expect } = require("chai")

// const { dualArbScan } = require("../../src/dualArbScan")
const { arbQuote } = require("../../src/utils/arbQuote")
const { poolInformation } = require("../../src/utils/poolInformation")
const { initPools } = require("../../src/utils/InitPools")
const { findArbitrageRoutes } = require("../../src/utils/findArbitrageRoutes")

const { data: poolsData } = require("../../src/jsonPoolData/uniswapPools.json")
const artifacts = {
    UniswapV3Router: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
}
const {
    weth9Abi: weth9Abi,
    UsdcAbi: UsdcAbi,
} = require("../mainnetTokens.json")

const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API

const pools = poolsData.pools
const amountInUsd = "100"
const BATCH_SIZE = 10
const BATCH_INTERVAL = 8000

WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

describe("DualArbBot Tests", function () {
    let deployer
    let weth, usdc, flashswap

    beforeEach(async function () {
        // create arb opportunity by swapping weth for usdc
        ;[deployer] = await ethers.getSigners()

        // Impersonate a whale account
        const whale = "0x2feb1512183545f48f6b9c5b4ebfcaf49cfca6f3" // Replace with a WETH or USDC whale address
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [whale],
        })

        const whaleSigner = await hre.ethers.getSigner(whale)

        // // Get the WETH and USDC contracts
        weth = new hre.ethers.Contract(WETH_ADDRESS, weth9Abi, deployer)
        usdc = new hre.ethers.Contract(USDC_ADDRESS, UsdcAbi, deployer)

        const whaleWethBalance = await weth.balanceOf(whale)

        const whaleUsdcBalance = await usdc.balanceOf(whale)

        console.log(whaleWethBalance.toString())
        console.log(whaleUsdcBalance.toString())

        // create arbitrage opportunity on route[0]
        // const routerAddress = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45" // Replace with the address of the Uniswap V3 Router contract on the testnet
        // const router = new hre.ethers.Contract(
        //     routerAddress,
        //     artifacts.UniswapV3Router.abi,
        // )
        const poolAddress = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8" // Replace with the address of the Uniswap V3 Pool contract on the testnet

        // Set the amount of input token to swap
        const amountIn = hre.ethers.parseEther("500") // Replace with the desired amount of input token

        // Set the minimum amount of output token to receive
        const amountOutMin = 0 // Replace with the minimum amount of output token you expect to receive

        // Set the deadline for the swap (in Unix timestamp format)
        const deadline = Math.floor(Date.now() / 1000) + 3600 // Replace with the desired deadline

        // Set the recipient address to receive the swapped tokens
        const recipient = whaleSigner // Replace with the desired recipient address

        // Approve the router to spend the input token
        await weth.approve(whaleSigner, amountIn)

        const ExactInputSingleParams = {
            tokenIn: WETH_ADDRESS,
            tokenOut: USDC_ADDRESS,
            fee: 3000,
            recipient: whaleSigner,
            deadline: await ethers.provider
                .getBlock("latest")
                .then((block) => block.timestamp + 1000),
            amountIn: amountIn,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
        }

        const swapTx = await router.exactInputSingle(ExactInputSingleParams)

        // Wait for the swap transaction to be mined
        await swapTx.wait()

        // Check the balance of the output token after the swap
        const outputTokenBalance = await usdc.balanceOf(recipient)
        console.log("Output Token Balance:", outputTokenBalance.toString())
    })
    it("runs tests", async function () {
        console.log("testing...")
    })
})
