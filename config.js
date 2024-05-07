const { FeeAmount } = require("@uniswap/v3-sdk")
const {
    USDC_TOKEN,
    WETH_TOKEN,
    USDT_TOKEN,
    DAI_TOKEN,
} = require("./src/utils/constants")
const { ethers } = require("hardhat")
require("dotenv").config()

const ALCHEMY_MAINNET_API = process.env.ALCHEMY_MAINNET_API

const CurrentConfig = {
    rpc: {
        local: "http://localhost:8545",
        mainnet: ALCHEMY_MAINNET_API,
    },

    USDCUSDT100: {
        token0: USDC_TOKEN,
        token1: USDT_TOKEN,
        poolFee: FeeAmount.LOWEST,
        amountIn: ethers.utils.parseUnits("1000", 6),
    },
    USDCUSDT500: {
        token0: USDC_TOKEN,
        token1: USDT_TOKEN,
        poolFee: FeeAmount.LOW,
        amountIn: ethers.utils.parseUnits("1000", 6),
    },
    USDCUSDT3000: {
        token0: USDC_TOKEN,
        token1: USDT_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseUnits("1000", 6),
    },
}

module.exports = { CurrentConfig }
