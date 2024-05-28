const { network, ethers, deployments, getNamedAccounts } = require("hardhat")
const { verify } = require("../src/utils/verify")

async function main() {
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    console.log("Deploying FlashSwapV3")

    const flashSwap = await deploy("FlashSwapV3", {
        from: deployer,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 6,
    })

    console.log("FlashSwap deployed to:", flashSwap.address)

    if (network.name !== "localhost") {
        console.log("Verifying contract...")
        await verify(flashSwap.address)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
