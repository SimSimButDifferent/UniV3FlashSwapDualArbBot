const hre = require("hardhat")

const { expect } = require("chai")

// const { dualArbScan } = require("../../src/dualArbScan")
const { arbQuote } = require("../../src/utils/arbQuote")
const { poolInformation } = require("../../src/utils/poolInformation")
const { initPools } = require("../../src/utils/InitPools")
const { findArbitrageRoutes } = require("../../src/utils/findArbitrageRoutes")

const { getProvider } = require("../../src/utils/getProvider")

const {
    data: poolsData,
} = require("../../src/jsonPoolData/arbitrumUniPools.json")
const artifacts = {
    UniswapV3Router: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
}
const {
    abi: flashSwapAbi,
} = require("../../ignition/deployments/chain-31337/artifacts/FlashSwapV3#FlashSwapV3.json")

const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")
const { weth9Abi, UsdtAbi } = require("../mainnetTokens.json")
const { ethers } = require("ethers")

const pools = poolsData.pools
const amountInUsd = "10"

WETH_ADDRESS = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
USDT_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"

const SWAP_ROUTER_02 = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
const FLASHSWAP_ADDRESS = "0x725314746e727f586e9fca65aed5dbe45aa71b99"

let deployer
let weth,
    usdt,
    wethAmount,
    flashSwapContract,
    uniswapV3Router,
    whale,
    whaleSigner,
    poolsArray,
    routesArray,
    tokenInfo,
    tokenIn

describe("DualArbBot Tests", function () {
    it("runs tests", async function () {
        // create arb opportunity by swapping weth for usdt
        ;[deployer] = await hre.ethers.getSigners()

        // Get the FlashSwap contract

        const provider = getProvider()

        flashSwapContract = new hre.ethers.Contract(
            FLASHSWAP_ADDRESS,
            flashSwapAbi,
            provider,
        )

        // Get the WETH and USDT contracts
        weth = new hre.ethers.Contract(WETH_ADDRESS, weth9Abi, deployer)
        usdt = new hre.ethers.Contract(USDT_ADDRESS, UsdtAbi, deployer)

        // Initialize the pools
        poolsArray = await initPools(pools)
        console.log(`Found ${poolsArray.length} pools`)

        // Output pool information and token amounts in for each token included in query.
        tokenInfo = await poolInformation(pools, amountInUsd)

        // Impersonate a whale account
        whale = "0xC3E5607Cd4ca0D5Fe51e09B60Ed97a0Ae6F874dd" // Replace with a WETH or USDT whale address
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [whale],
        })

        whaleSigner = await hre.ethers.getSigner(whale)

        const whaleWethBalance = await weth.balanceOf(whale)

        const whaleUsdtBalance = await usdt.balanceOf(whale)

        console.log(
            "Initial whale WETH balance:",
            hre.ethers.formatEther(whaleWethBalance.toString()),
        )
        console.log(
            "Initial whale USDT balance:",
            hre.ethers.formatUnits(whaleUsdtBalance.toString(), 6),
        )

        // Transfer WETH from whale to deployer
        wethAmount = hre.ethers.parseEther("10")

        // Get the Uniswap V3 Router contract
        uniswapV3Router = new hre.ethers.Contract(
            SWAP_ROUTER_02,
            artifacts.UniswapV3Router.abi,
            deployer,
        )

        // Approve the router to spend WETH
        await weth.connect(whaleSigner).approve(SWAP_ROUTER_02, wethAmount)

        const params = {
            tokenIn: WETH_ADDRESS,
            tokenOut: USDT_ADDRESS,
            fee: 3000,
            recipient: whaleSigner.address,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes from now
            amountIn: wethAmount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
            // gasLimit: ethers.hexlify(1000000), // Set a high gas limit
            // maxFeePerGas: 9470890005, // Set max fee per gas
            // maxPriorityFeePerGas: 3000000000, // Set priority fee
        }

        try {
            console.log(
                "Executing swap - 10 WETH for USDT to create arb opportunity...",
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
        const newWhaleUsdtBalance = await usdt.balanceOf(whaleSigner.address)
        console.log("--------------------")
        console.log(
            "New Whale WETH balance:",
            hre.ethers.formatEther(newWhaleWethBalance.toString()),
        )
        console.log(
            "New Whale USDT balance:",
            hre.ethers.formatUnits(newWhaleUsdtBalance.toString(), 6),
        )

        // Get possible arbitrage routes where tokenIn and tokenOut are the same.
        routesArray = await findArbitrageRoutes(pools, tokenInfo)

        // console.log("token amounts in: ", tokenInfo)
        console.log("amount in usd: ", amountInUsd)

        const route = [
            "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            "500",
            "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            "3000",
            "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            18,
            6,
            3478515065841014n,
            34785150658410n,
            "WETH",
            "0x641c00a822e8b671738d32a431a4fb6074e5c79d",
            10001175n,
        ]

        console.log("test route: ", route)

        const amountInFlash = route[11]
        const routeNumber = 0

        console.log("Calling Flashswap...")

        poolAddress = ethers.getAddress(route[10])
        feePool1 = route[3]
        tokenIn = route[0]
        tokenOut = route[2]
        token0Decimals = Number(route[5])

        try {
            // Call flashswap
            const tx = await flashSwapContract.connect(deployer).flashSwap(
                poolAddress,
                feePool1,
                tokenIn,
                tokenOut,
                amountInFlash, // Make sure any amountIn inputs are formatted like this.
                0,
            )

            console.log(`Route ${routeNumber} Info:`)
            console.log(`amountIn - ${amountInFlash} USDT`)

            console.log(
                `Path - ${route[0]} -> ${route[1]} -> ${route[2]} -> ${route[3]} -> ${route[4]}`,
            )

            // Get transaction receipt
            const txReceipt = await tx.wait()
            console.log("Transaction Receipt: ", txReceipt)

            // Wait for the HRE to mine a block
            await hre.network.provider.send("evm_mine")

            await new Promise((resolve) => setTimeout(resolve, 2000))

            const deployerUsdtBalance = await usdt.balanceOf(deployer.address)

            // Perform the checks here
            console.log(
                "Deployer Weth balance after Arb",
                await weth.balanceOf(deployer.address),
            )
            console.log(
                "Deployer Usdt balance after Arb",
                await usdt.balanceOf(deployer.address),
            )

            expect(deployerUsdtBalance).to.be.greaterThan("0")
        } catch (error) {
            console.error("Error executing flashswap:", error)
        }
    })
})
