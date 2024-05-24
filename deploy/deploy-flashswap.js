const { network } = require("hardhat")
const { verify } = require("../src/utils/verify")

async function main() {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // const FlashSwapV3 = await ethers.getContractFactory("FlashSwap")
    const flashSwap = await deploy("FlashSwap", {
        from: deployer,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 6,
    })

    const flashSwapAddress = flashSwap.address

    console.log("FlashSwap deployed to:", flashSwapAddress)

    await verify(flashSwapAddress)
}
