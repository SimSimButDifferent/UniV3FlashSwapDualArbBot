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

    USDTUSDC: {
        token0: USDT_TOKEN,
        token1: USDC_TOKEN,
        poolFee: FeeAmount.MEDIUM,
        amountIn: ethers.utils.parseUnits("1", 6),
    },
}

module.exports = { CurrentConfig }
