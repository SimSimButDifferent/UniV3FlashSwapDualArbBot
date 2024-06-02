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
    })
    describe("getPools", function () {
        it("Should correctly create uniswapPools json file", async function () {
            expect(pools).to.be.an("array")
            expect(pools).to.have.length.greaterThan(0)
        })
    })

    describe("initPools", function () {
        it("Should correctly initialize all the pools", async function () {
            const poolsArray = await initPools(pools)
            expect(poolsArray).to.be.an("array")
            expect(poolsArray).to.have.length.greaterThan(0)
        })
    })

    describe("findArbitrageRoutes", function () {
        let tokenAmountsIn
        it("Should correctly find arbitrage routes", async function () {
            await initPools(pools)

            tokenAmountsIn = await poolInformation(pools, amountInUsd)

            const routesArray = await findArbitrageRoutes(
                pools,
                tokenAmountsIn,
                amountInUsd,
            )
            expect(routesArray).to.be.an("array")
            expect(routesArray).to.have.length.greaterThan(0)
        })
    })

    describe("arbQuote", function () {
        let route, amountIn, routeNumber
        before(async function () {
            await initPools(pools)
            const tokenAmountsIn = await poolInformation(pools, amountInUsd)
            const routesArray = await findArbitrageRoutes(
                pools,
                tokenAmountsIn,
                amountInUsd,
            )
            route = routesArray[9]
            amountIn = route[7]
            routeNumber = 0
            profitThreshold = route[8]
            console.log(route)
        })
        it("Should correctly calculate the arbitrage quote", async function () {
            const quote = await arbQuote(route, amountIn, routeNumber)

            expect(quote).to.be.an("array")
            expect(quote[0]).to.be.a("BigInt")
        })
    })
})
