const hre = require("hardhat")
const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

async function main() {
    if (developmentChains.includes(network.name)) {
        // Deploy the FlashSwap Contract
        const FlashSwap = await hre.ethers.getContractFactory("FlashSwap")

        console.log("Deploying FlashSwap...")

        const flashSwap = await FlashSwap.deploy()
        const flashSwapAddress = flashSwap.target
        console.log(`FlashSwap deployed to: ${flashSwapAddress}`)
        console.log("--------------------------------------------------")
    }

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // Deploy the FlashSwap
        const FlashSwap = await hre.ethers.getContractFactory("FlashSwap")

        console.log("Deploying FlashSwap...")

        const desiredConfirmations = 6

        const flashSwap = await FlashSwap.deploy()
        const flashSwapAddress = flashSwap.target
        console.log(`FlashSwap deployed to: ${flashSwapAddress}`)

        const flashSwapReceipt = await flashSwap
            .deploymentTransaction()
            .wait(desiredConfirmations)

        console.log(
            `Transaction confirmed. Block number: ${flashSwapReceipt.blockNumber}`,
        )
        await hre.run("verify:etherscan", { address: flashSwapAddress })
        console.log("FlashSwap verified!")
        console.log("--------------------------------------------------")
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
