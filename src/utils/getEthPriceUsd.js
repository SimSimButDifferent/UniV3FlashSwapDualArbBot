const { Chainlink } = require("dev3-sdk")

const ethSDK = Chainlink.instance(
    "https://ethereum.publicnode.com",
    Chainlink.PriceFeeds.ETH,
)

async function getEthPriceUsd() {
    const roundData = await ethSDK.getFromOracle(ethSDK.feeds.ETH_USD)
    const ethPriceUsdBigInt = roundData.answer
    const ethPriceUsd = ethers.utils
        .formatUnits(ethPriceUsdBigInt, "8")
        .toString()
    console.log(typeof ethPriceUsd)
    console.log("ETH price in USD: ", ethPriceUsd)
    return ethPriceUsd, ethPriceUsdBigInt
}

getEthPriceUsd()
