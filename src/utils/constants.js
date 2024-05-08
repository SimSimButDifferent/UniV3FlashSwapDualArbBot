const { Token, ChainId } = require("@uniswap/sdk-core")

// Contract Addresses

const POOL_FACTORY_CONTRACT_ADDRESS =
    "0x1F98431c8aD98523631AE4a59f267346ea31F984"
const QUOTER_CONTRACT_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
const SWAP_ROUTER_02_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"

// Token Addresses

const WETH_TOKEN = new Token(
    ChainId.MAINNET,
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    18,
    "WETH",
    "Wrapped Ether",
)

const USDC_TOKEN = new Token(
    ChainId.MAINNET,
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    6,
    "USDC",
    "USDC",
)

const USDT_TOKEN = new Token(
    ChainId.MAINNET,
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
    6,
    "USDT",
    "Tether",
)

const DAI_TOKEN = new Token(
    ChainId.MAINNET,
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    18,
    "DAI",
    "Dai",
)

module.exports = {
    WETH_TOKEN,
    USDC_TOKEN,
    USDT_TOKEN,
    DAI_TOKEN,
    POOL_FACTORY_CONTRACT_ADDRESS,
    QUOTER_CONTRACT_ADDRESS,
}
