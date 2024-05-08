const { ethers } = require("hardhat")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const { getProvider } = require("./getProvider.js")

async function initPools(poolsArray) {
    const provider = getProvider()
    const InitPools = []
    for (let i = 0; i < poolsArray.length; i++) {
        const poolContract = new ethers.Contract(
            poolsArray[i].id,
            PoolAbi,
            provider,
        )

        InitPools.push(poolContract)
    }
    return InitPools
}

exports.initPools = initPools
