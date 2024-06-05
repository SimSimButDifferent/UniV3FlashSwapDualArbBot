const hre = require("hardhat")
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")
const { expect } = require("chai")

// const { dualArbScan } = require("../../src/dualArbScan")
const { arbQuote } = require("../../src/utils/arbQuote")
const { poolInformation } = require("../../src/utils/poolInformation")
const { initPools } = require("../../src/utils/InitPools")
const { findArbitrageRoutes } = require("../../src/utils/findArbitrageRoutes")
const { dualArbScan } = require("../../src/dualArbScan")
const Flas = require("../../ignition/modules/igniteFlashSwap")

const { data: poolsData } = require("../../src/jsonPoolData/uniswapPools.json")
const artifacts = {
    UniswapV3Router: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
}
const { weth9Abi, UsdcAbi } = require("../mainnetTokens.json")

const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API

const pools = poolsData.pools
const amountInUsd = "100"
const BATCH_SIZE = 10
const BATCH_INTERVAL = 8000

WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

const UNISWAP_V3_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

let deployer
let weth,
    usdc,
    wethAmount,
    flashSwap,
    uniswapV3Router,
    whale,
    whaleSigner,
    poolsArray,
    routesArray,
    tokenAmountsIn

describe("DualArbBot Tests", function () {
    // let deployer
    // let weth,
    //     usdc,
    //     wethAmount,
    //     FlashSwap,
    //     flashSwap,
    //     uniswapV3Router,
    //     whale,
    //     whaleSigner,
    //     poolsArray,
    //     routesArray,
    //     tokenAmountsIn

    before(async function () {
        // create arb opportunity by swapping weth for usdc
        ;[deployer] = await hre.ethers.getSigners()

        // // Create instance of flashswap contract
        // const { flashSwap } = await hre.ignition.deploy(FlashSwap)

        FlashSwap = buildModule("FlashSwapV3", (m) => {
            const flashSwap = m.contractAt(
                "FlashSwapV3",
                "0xf42ec71a4440f5e9871c643696dd6dc9a38911f8",
            )

            return { flashSwap }
        })

        // Impersonate a whale account
        whale = "0x2feb1512183545f48f6b9c5b4ebfcaf49cfca6f3" // Replace with a WETH or USDC whale address
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [whale],
        })

        whaleSigner = await hre.ethers.getSigner(whale)

        // // Get the WETH and USDC contracts
        weth = new hre.ethers.Contract(WETH_ADDRESS, weth9Abi, deployer)
        usdc = new hre.ethers.Contract(USDC_ADDRESS, UsdcAbi, deployer)

        // Get the flashswap contract
        f

        const whaleWethBalance = await weth.balanceOf(whale)

        const whaleUsdcBalance = await usdc.balanceOf(whale)

        console.log(
            "Initial whale WETH balance:",
            hre.ethers.formatEther(whaleWethBalance.toString()),
        )
        console.log(
            "Initial whale USDC balance:",
            hre.ethers.formatUnits(whaleUsdcBalance.toString(), 6),
        )

        // Transfer WETH from whale to deployer
        wethAmount = hre.ethers.parseEther("500")

        // Get the Uniswap V3 Router contract
        uniswapV3Router = new hre.ethers.Contract(
            UNISWAP_V3_ROUTER_ADDRESS,
            artifacts.UniswapV3Router.abi,
            deployer,
        )

        // Approve the router to spend WETH
        await weth
            .connect(whaleSigner)
            .approve(UNISWAP_V3_ROUTER_ADDRESS, wethAmount)

        const params = {
            tokenIn: WETH_ADDRESS,
            tokenOut: USDC_ADDRESS,
            fee: 3000,
            recipient: whaleSigner.address,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes from now
            amountIn: wethAmount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
            // gasLimit: ethers.utils.hexlify(1000000), // Set a high gas limit
            maxFeePerGas: 9470890005, // Set max fee per gas
            maxPriorityFeePerGas: 3000000000, // Set priority fee
        }

        try {
            console.log(
                "Executing swap - 500 WETH for USDC to create arb opportunity...",
            )
            const tx = await uniswapV3Router
                .connect(whaleSigner)
                .exactInputSingle(params)

            await tx.wait()
            console.log("Swap executed successfully")
        } catch (error) {
            console.error("Error executing exactInputSingle:", error)
        }

        // Verify balances
        const newWhaleWethBalance = await weth.balanceOf(whaleSigner.address)
        const newWhaleUsdcBalance = await usdc.balanceOf(whaleSigner.address)
        console.log("--------------------")
        console.log(
            "New Whale WETH balance:",
            hre.ethers.formatEther(newWhaleWethBalance.toString()),
        )
        console.log(
            "New Whale USDC balance:",
            hre.ethers.formatUnits(newWhaleUsdcBalance.toString(), 6),
        )

        // Initialize the pools
        poolsArray = await initPools(pools)
        console.log(`Found ${poolsArray.length} pools`)

        // Output pool information and token amounts in for each token included in query.
        tokenAmountsIn = await poolInformation(pools, amountInUsd)

        // Get possible arbitrage routes where tokenIn and tokenOut are the same.
        routesArray = await findArbitrageRoutes(
            pools,
            tokenAmountsIn,
            amountInUsd,
        )

        // return { poolsArray, routesArray }
    })
    describe("FlashSwapV3", function () {
        beforeEach(async function () {})
        it("Should correctly log profit of each token", async function () {
            const { flashswap } = await hre.ignition.deploy(FlashSwap)
        })
    })
    describe("Dual Arb Scan", function () {
        it("runs tests", async function () {
            const route = routesArray[9]
            const amountInFromArray = route[7]
            const routeNumber = 9
            const profitThreshold = route[8]
            console.log("testing...")
            console.log("route", route)
            console.log("amount in from array", amountInFromArray)
            console.log("route number", routeNumber)
            console.log("profit threshold", profitThreshold)
            await dualArbScan(pools)
            // await new Promise((resolve) => setTimeout(resolve, 60000))
            // await arbQuote(
            //     route,
            //     amountInFromArray,
            //     routeNumber,
            //     profitThreshold,
            // )
            console.log(
                "Deployer Weth balance after Arb",
                await weth.balanceOf(deployer.address),
            )
            console.log(
                "Deployer Usdc balance after Arb",
                await usdc.balanceOf(deployer.address),
            )
        }, 90000)
    })
})
