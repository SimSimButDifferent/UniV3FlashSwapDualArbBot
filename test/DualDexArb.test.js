const { expect } = require("chai")
const { ethers, network } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers")

describe("FlashSwap", function () {
    let FlashSwap, flashSwap, usdcContractAddress, borrowAmount, signer

    beforeEach(async function () {
        const address = "0xcb999Ce7f2530515f5188c313Fd05Eb2546ddBdB"

        await helpers.impersonateAccount(address)

        signer = await ethers.getSigner(address)

        FlashSwap = await ethers.getContractFactory("FlashSwap")
        flashSwap = await FlashSwap.deploy()

        // Find a USDC whale with more ETH
        usdcContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

        // borrow amount in USDC which has 6 0's
        borrowAmount = 1000000000
    })

    describe("testFlashSwap", function () {
        it("Should execute FlashSwap", async function () {
            const tx = await flashSwap
                .connect(signer)
                .flashSwap(usdcContractAddress, borrowAmount)

            await tx.wait()
        })
    })
})
