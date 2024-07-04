const { ethers } = require("hardhat")

const networkConfig = {
    1: {
        name: "mainnet",
        quoter2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    },
    8453: {
        name: "base mainnet",
        quoter2: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    },
    42161: {
        name: "arbitrum",
        quoter2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        // quoter2: "0x5e55c9e631fae526cd4b0526c4818d6e0a9ef0e3", // VIEW ONLY QUOTER
        flashSwapV3Address: "0xf812197DbdbcD0f80cD003C20f695dc8d06bC3b0",
    },
    quoter2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    31337: {
        name: "localhost",
        quoter2: "0x0b306bf915c4d645ff596e518faf3f9669b97016",
        flashSwapV3Address: "0xc5b7205454Ef2e4DDe093442bC1b1457E46B0352",
    },
}

developmentChains = ["localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
