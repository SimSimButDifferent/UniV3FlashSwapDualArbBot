const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("FlashSwapV3", (m) => {
    const flashSwap = m.contract("FlashSwapV3")

    return { flashSwap }
})
