const { FeeAmount } = require("@uniswap/v3-sdk")
const {
    USDC_TOKEN,
    WETH_TOKEN,
    USDT_TOKEN,
    WBTC_TOKEN,
    LINK_TOKEN,
    UNI_TOKEN,
    AAVE_TOKEN,
    CRV_TOKEN,
} = require("./src/utils/constants")
const { ethers } = require("hardhat")
require("dotenv").config()

const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API

const CurrentConfig = {
    rpc: {
        local: "http://localhost:8545",
        mainnet: ALCHEMY_MAINNET_API,
    },
    WETHUSDC: {
        in: WETH_TOKEN,
        out: USDC_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseEther("1"),
    },
    USDTUSDC: {
        in: USDT_TOKEN,
        out: USDC_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseUnits("1", 6),
    },
    WBTCUSDT: {
        in: WBTC_TOKEN,
        out: USDT_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseUnits("1", 8),
    },
    LINKUSDT: {
        in: LINK_TOKEN,
        out: USDT_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseEther("1"),
    },
    UNIUSDT: {
        in: UNI_TOKEN,
        out: USDT_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseEther("1"),
    },
    AAVEUSDC: {
        in: AAVE_TOKEN,
        out: USDC_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseEther("1"),
    },
    CRVUSDT: {
        in: CRV_TOKEN,
        out: USDT_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseEther("1"),
    },
    USDTAAVE: {
        in: USDT_TOKEN,
        out: AAVE_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseUnits("1", 6),
    },
}

module.exports = { CurrentConfig }
