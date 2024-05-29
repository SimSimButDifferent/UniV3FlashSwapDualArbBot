const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("FlashSwap", (m) => {
    const flashSwap = m.contract("FlashSwapV3")

    // m.call(apollo, "launch", [])

    return { flashSwap }
})
