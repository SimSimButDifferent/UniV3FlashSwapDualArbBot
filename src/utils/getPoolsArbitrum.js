const fs = require("fs")

const SUBGRAPH_API_KEY = process.env.SUBGRAPH_API_KEY
console.log("SUBGRAPH_API_KEY:", process.env.SUBGRAPH_API_KEY)

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
          token0_in: ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1", "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", "0x912ce59144191c1204e64559fe8253a0e49e6548"]
          token1_in: ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1", "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", "0x912ce59144191c1204e64559fe8253a0e49e6548"]
          volumeUSD_gte: 500000,
          totalValueLockedUSD_gt: 1000000,
          id_not: "0x14af1804dbbf7d621ecc2901eef292a24a0260ea"
        }
        first:30,
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
        "src/jsonPoolData/arbitrumUniPools.json",
        JSON.stringify(jsonDict, null, 2),
    )

    return jsonDict
}

getPools()
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((error) => console.error("Error fetching data:", error))

exports.getPools = getPools
