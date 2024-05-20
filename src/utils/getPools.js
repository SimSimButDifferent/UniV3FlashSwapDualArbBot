const fs = require("fs")
const USDC = `"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"`
const USDT = `"0xdac17f958d2ee523a2206206994597c13d831ec7"`
const WETH = `"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"`
const WBTC = `"0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"`
const DAI = `"0x6b175474e89094c44da98b954eedeac495271d0f"`

async function getPools() {
    const query = `
    {
      pools(where: {
        token0_in: [${USDT}, ${USDC}, ${WETH}],
        token1_in: [${USDT}, ${USDC}, ${WETH}],
        liquidity_gt: "10000000000000",
        totalValueLockedUSD_gt: 1000000,
      }, first: 1000) {
        id
        feeTier
        liquidity
        totalValueLockedUSD
        tick
        token0 {
          id
          symbol
          name
          decimals
        }
        token1 {
          id
          symbol
          name
          decimals
        }
      }
    }
  `

    const url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
    })

    const jsonDict = await response.json()

    // Write the response to a file

    fs.writeFileSync(
        "src/jsonPoolData/uniswapPools.json",
        JSON.stringify(jsonDict, null, 2),
    )

    return jsonDict
}

getPools()
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((error) => console.error("Error fetching data:", error))

exports.getPools = getPools
