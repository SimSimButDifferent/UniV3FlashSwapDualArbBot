const axios = require("axios")
require("./getProvider")

const getTokenInfo = async (tokens, amountInUsd) => {
    const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

    const tokenSymbols = Object.keys(tokens)
    const prices = await axios.get(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`,
        {
            params: {
                symbol: tokenSymbols.join(","),
            },
            headers: {
                "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
            },
        },
    )

    const result = {}
    for (const tokenSymbol of tokenSymbols) {
        const tokenInfo = tokens[tokenSymbol]
        const priceInUsd = prices.data.data[tokenSymbol].quote.USD.price
        const amountInDecimal = (amountInUsd / priceInUsd).toString()
        const baseUnit = BigInt(
            Math.floor(parseFloat(amountInDecimal) * 10 ** tokenInfo.decimals),
        )
        result[tokenSymbol] = {
            amountIn: baseUnit,
            profitThreshold: baseUnit / 100n,
            priceInUsd: priceInUsd,
        }
    }
    console.log("Token Info: ", result)
    return result
}

module.exports = { getTokenInfo }

// ---------------- FOR TESTING ---------------- run: node src/utils/getTokenAmountsIn.js

// const tokens = {
//     USDT: {
//         address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
//         decimals: 6,
//     },
//     USDC: {
//         address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//         decimals: 6,
//     },
//     WETH: {
//         address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//         decimals: 18,
//     },
//     GMX: {
//         address: "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
//         decimals: 18,
//     },
//     WBTC: {
//         address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
//         decimals: 8,
//     },
//     ARB: {
//         address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
//         decimals: 18,
//     },
//     PENDLE: {
//         address: "0x808507121B80c02388fAd14726482e061B8da827",
//         decimals: 18,
//     },
// }

// getTokenInfo(tokens, "100").catch((error) => {
//     console.error(error)
// })
