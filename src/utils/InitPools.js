const { ethers } = require("hardhat")
const {
    abi: PoolAbi,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const { getProvider } = require("./getProvider.js")

async function initPools(pools) {
    const provider = getProvider()
    const poolsArray = []
    for (let i = 0; i < pools.length; i++) {
        const poolContract = new ethers.Contract(pools[i].id, PoolAbi, provider)

        poolsArray.push(poolContract)
    }
    return poolsArray
}

exports.initPools = initPools
