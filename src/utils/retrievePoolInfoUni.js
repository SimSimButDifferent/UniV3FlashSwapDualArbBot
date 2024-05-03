const fs = require("fs")

async function retrieveUniswapStablecoinPools() {
    const query = `
    {
      pools(where: {
        token0_in: ["0xdac17f958d2ee523a2206206994597c13d831ec7", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0x6b175474e89094c44da98b954eedeac495271d0f"],
        token1_in: ["0xdac17f958d2ee523a2206206994597c13d831ec7", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0x6b175474e89094c44da98b954eedeac495271d0f"]
      }, first: 1000) {
        id
        feeTier
        liquidity
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
        "src/utils/jsonPoolData/uniswapStablecoinPools.json",
        JSON.stringify(jsonDict, null, 2),
    )

    return jsonDict
}

retrieveUniswapStablecoinPools()
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((error) => console.error("Error fetching data:", error))
