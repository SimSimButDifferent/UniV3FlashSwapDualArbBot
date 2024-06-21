const axios = require("axios")
const ethers = require("ethers")
const { getProvider } = require("./getProvider")

const getTokenAmountsIn = async (tokens, amountInUsd) => {
    const provider = getProvider() // Ensure this matches your setup
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

    console.log(`Prices: `, prices.data.data)

    const amountsIn = {}
    for (const tokenSymbol of tokenSymbols) {
        const tokenInfo = tokens[tokenSymbol] // Now expecting an object with address and decimals
        const priceInUsd = prices.data.data[tokenSymbol].quote.USD.price
        console.log(`Price ${tokenSymbol} in usd: `, priceInUsd)
        // const amountInWei = ethers.parseUnits(
        //     (amountInUsd / priceInUsd).toString(),
        //     tokenInfo.decimals, // Use decimals from the tokenInfo object
        // )
        // amountsIn[tokenSymbol] = amountInWei
    }

    return amountsIn
}

const tokens = {
    USDT: {
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        decimals: 6,
    },
    USDC: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
    },
    WETH: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
    },
    GMX: {
        address: "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
        decimals: 18,
    },
    WBTC: {
        address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
        decimals: 8,
    },
    ARB: {
        address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        decimals: 18,
    },
    PENDLE: {
        address: "0x808507121B80c02388fAd14726482e061B8da827",
        decimals: 18,
    },
} // Assuming GMX has 18 decimals as an example
// Add more tokens here following the same pattern

const amountInUsd = 100

getTokenAmountsIn(tokens, amountInUsd)
    .then((amountsIn) => {
        console.log(amountsIn)
    })
    .catch((error) => {
        console.error(error)
    })
