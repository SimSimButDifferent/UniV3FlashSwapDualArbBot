const { expect } = require("chai")
const { ethers, network } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { mainnet } = require("../context/UniswapContractAddresses.json")
const ABI = require("../context/mainnetTokens.json")

describe("FlashSwap", function () {
    let FlashSwap, flashSwap, allowanceAmount
    const address = "0x13e003a57432062e4EdA204F687bE80139AD622f"

    beforeEach(async function () {
        await helpers.impersonateAccount(address)

        const signer = await ethers.getSigner(address)

        FlashSwap = await ethers.getContractFactory("FlashSwap")
        flashSwap = await FlashSwap.connect(signer).deploy(mainnet.usdcEthPool)
    })

    describe("testFlashSwap", function () {
        it("Should execute FlashSwap", async function () {
            await helpers.impersonateAccount(address)

            const signer = await ethers.getSigner(address)

            console.log(address)
            await helpers.impersonateAccount(address)

            // Create a contract instance for the token
            const Usdc = new ethers.Contract(
                ABI.UsdcContractAddress,
                ABI.UsdcAbi,
                signer,
            )

            // Set an allowance for the FlashSwap contract
            allowanceAmount = ethers.parseUnits("100000", 6) // Example amount, adjust as needed
            await Usdc.approve(flashSwap.target, allowanceAmount)

            console.log(allowanceAmount.toString())
            const balance = await Usdc.balanceOf(signer.address)
            console.log(balance.toString())

            const tx = await flashSwap.flash(allowanceAmount, 0)

            await tx.wait()
        })
    })
})
