const fs = require("fs")

const SUBGRAPH_API_KEY = process.env.SUBGRAPH_API_KEY

/**
 * @dev This function gets the pools from the Uniswap V3 subgraph
 * @returns {object} jsonDict
 */
async function getPools() {
    // The query to get the pools from the Uniswap V3 subgraph

    const query = `
    {
      pools(
        where: {
          volumeUSD_gte: 500000,
          id_not: "0x14af1804dbbf7d621ecc2901eef292a24a0260ea"
        }
        first:7,
        orderBy: totalValueLockedUSD,
        orderDirection: desc
      ) {
        id
        feeTier
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
        token0Price
        token1Price
      }
    }
  `
    // Subgraph URL
    const url = `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM`

    // Log the response from the subgraph
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
        "src/jsonPoolData/ArbitrumUniPools.json",
        JSON.stringify(jsonDict, null, 2),
    )

    return jsonDict
}

getPools()
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((error) => console.error("Error fetching data:", error))

exports.getPools = getPools
