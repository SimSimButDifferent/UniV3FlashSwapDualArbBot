const { ethers } = require("hardhat")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const { getProvider } = require("../getProvider.js")
const poolsArray = require("../jsonPoolData/pools.js")

async function initPools(poolsArray) {
    const provider = getProvider()
    const pools = []
    for (let i = 0; i < poolsArray.length; i++) {
        const poolContract = new ethers.Contract(
            poolsArray[i].id,
            PoolAbi,
            provider,
        )

        pools.push(poolContract)
    }
    return pools
}

exports.initPools = initPools
