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
        flashSwapV3Address: "0xf93b0549cd50c849d792f0eae94a598fa77c7718",
    },
}

developmentChains = ["localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
