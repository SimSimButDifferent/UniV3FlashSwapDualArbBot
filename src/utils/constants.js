const { Token, ChainId } = require("@uniswap/sdk-core")

// Contract Addresses

const POOL_FACTORY_CONTRACT_ADDRESS =
    "0x1F98431c8aD98523631AE4a59f267346ea31F984"
const QUOTER_CONTRACT_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"

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

const WBTC_TOKEN = new Token(
    ChainId.MAINNET,
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    8,
    "WBTC",
    "Wrapped Bitcoin",
)

const LINK_TOKEN = new Token(
    ChainId.MAINNET,
    "0x514910771af9ca656af840dff83e8264ecf986ca",
    18,
    "LINK",
    "Chainlink",
)

const UNI_TOKEN = new Token(
    ChainId.MAINNET,
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    18,
    "UNI",
    "Uniswap",
)

const AAVE_TOKEN = new Token(
    ChainId.MAINNET,
    "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    18,
    "AAVE",
    "Aave Token",
)

const CRV_TOKEN = new Token(
    ChainId.MAINNET,
    "0xd533a949740bb3306d119cc777fa900ba034cd52",
    18,
    "CRV",
    "Curve DAO Token",
)

module.exports = {
    WETH_TOKEN,
    USDC_TOKEN,
    USDT_TOKEN,
    DAI_TOKEN,
    WBTC_TOKEN,
    LINK_TOKEN,
    UNI_TOKEN,
    AAVE_TOKEN,
    CRV_TOKEN,
    POOL_FACTORY_CONTRACT_ADDRESS,
    QUOTER_CONTRACT_ADDRESS,
}
