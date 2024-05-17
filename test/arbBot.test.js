const { ethers } = require("hardhat")
const { expect } = require("chai")

const { dualArbScan } = require("../src/dualArbScan")

const { data: poolsData } = require("../src/jsonPoolData/uniswapPools.json")
const { initPools } = require("../src/utils/InitPools")
const pools = poolsData.pools

describe("DualArbBot Tests", function () {
    describe("getPools", function () {
        it("Should correctly create uniswapPools json file", async function () {
            expect(pools).to.be.an("array")
            expect(pools).to.have.length.greaterThan(0)
        })
    })

    describe("initPools", function () {
        it("Should correctly initialize all the pools", async function () {
            const poolsArray = await initPools(pools)
            expect(poolsArray).to.be.an("array")
            expect(poolsArray).to.have.length.greaterThan(0)
        })
    })
})
