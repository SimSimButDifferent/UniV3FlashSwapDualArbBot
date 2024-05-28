const networkConfig = {
    1: {
        name: "mainnet",
        quoter2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    },
    8453: {
        name: "base mainnet",
        quoter2: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    },
    31337: {
        name: "localhost",
        quoter2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        flashSwapV3Address: "0xf42ec71a4440f5e9871c643696dd6dc9a38911f8",
    },
}

developmentChains = ["localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
