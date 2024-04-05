const { expect } = require("chai")
const { ethers, network } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { mainnet } = require("../context/UniswapContractAddresses.json")

describe("FlashSwap", function () {
    let FlashSwap, flashSwap, usdcContractAddress, borrowAmount, signer

    beforeEach(async function () {
        const address = "0xa14516A145aad726b09E13572A79c10Ee17772a1"

        await helpers.impersonateAccount(address)

        signer = await ethers.getSigner(address)

        FlashSwap = await ethers.getContractFactory("FlashSwap")
        flashSwap = await FlashSwap.deploy()

        // Find a USDC whale with more ETH
        usdcContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

        // borrow amount in USDC which has 6 0's
        borrowAmount = 1000000000
    })

    describe("testFlashSwap", function () {
        it("Should execute FlashSwap", async function () {
            console.log(signer)

            // const tx = await flashSwap
            //     .connect(signer)
            //     .flash(usdcContractAddress, borrowAmount)

            // await tx.wait()
        })
    })
})
