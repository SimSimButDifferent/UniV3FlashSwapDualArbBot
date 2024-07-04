![image](https://github.com/SimSimButDifferent/L7-UniV3FlashSwapDualArbBot/assets/88177427/f4872696-36f5-429f-8cf2-70f87d911abf)

## Arbitrum Branch (most up-to-date branch 🌿)

The contract is now deployed to on arbitrum at the address - [0xf812197dbdbcd0f80cd003c20f695dc8d06bc3b0](https://arbiscan.io/address/0xf812197dbdbcd0f80cd003c20f695dc8d06bc3b0)

As it stands the script spends about 1,400,000 compute units per day, roughly 42,000,000 per month. 

I am currently testing it with an input of 10 usd value. the amountIn for each token is calculated using this value.

Testing still continuing.

## Uniswap V3 Flashswap Arbitrage bot.

This project is broken down into 2 main parts.

### Flashswap function smart contract + Arbitrage scanner

The idea is for the script to scan the pools for current prices and execute flashswap arbitrage with a given amountIn.

You do this my first running **getPools.js**, which queries the [uniswapV3 subgraph](https://thegraph.com/explorer/subgraphs/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM?view=Query&chain=arbitrum-one) and writes a json file to ./src/jsonPoolData/ that is an object containing all of the pools neccesary information. 

Right now it is configured to pool for pools that include WETH, WBTC, ARB and USDT, that have atotalValueLocked in USD of above $1,000,000. 

You can configure the query how you like, the script should still run the same way.

**Here is an overview of what the script does:**

-   Scans all routes between a given set of pools.
-   Is the route profitable? (minimum amount out = amount in + profit threshhold(currently 1%))
-   Format the route for input into the flashswap function.
-   Execute Flashswap smart contract function and log profits.


**Created using both:**

[Foundry](https://book.getfoundry.sh/) - For testing the Smart contract, written in Solidity

[Hardhat](https://hardhat.org/) - For testing the scanner and all of it's dependencies, written in javascript.

## Installation

```bash
git clone https://github.com/SimSimButDifferent/L7-UniV3FlashSwapDualArbBot

yarn

foundryup
foundry init

yarn hardhat init
```

## Testing

**Set rpc fork url - Node provider API key (Alchemy, Infura etc)**

If you haven't already, go get a mainnet API key from [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/) or [Quicknode](https://www.quicknode.com/).

```bash
FORK_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### Foundry testing ❤️‍🔥

**Run the local node**

You can go to arbscan.io if you want to get a more recent block number.

```bash
anvil --fork-url FORK_URL --fork-block-number 225459063 --fork-chain-id 42161 --chain-id 42161
```
Split the terminal and deploy flashSwapV3.sol to the forked mainnet: 🚀

```bash
forge script script/DeployFlashSwapV3.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --legacy
```
```bash
[⠊] Compiling...
[⠰] Compiling 33 files with Solc 0.7.6
[⠔] Solc 0.7.6 finished in 1.26s
Compiler run successful!
Script ran successfully.

== Return ==
0: contract FlashSwapV3 0xf812197DbdbcD0f80cD003C20f695dc8d06bC3b0

## Setting up 1 EVM.

==========================

Chain 42161

Estimated gas price: 0.020000001 gwei

Estimated total gas used for script: 951147

Estimated amount required: 0.000019022940951147 ETH

==========================

##### arbitrum
✅  [Success]Hash: 0x5b90cfccca9b3333887acabe36b8158af16946c6320ddebdf46576d5475a9b22
Contract Address: 0xf812197DbdbcD0f80cD003C20f695dc8d06bC3b0
Block: 20166493
Paid: 0.000006401956463304 ETH (731652 gas * 0.008750002 gwei)

✅ Sequence #1 on arbitrum | Total Paid: 0.000006401956463304 ETH (731652 gas * avg 0.008750002 gwei)
```

**Run Foundry tests**

```bash
forge test -vv --rpc-url http://127.0.0.1:8545
```
```bash
[⠒] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/FlashSwapV3Test.t.sol:UniswapV3FlashTest
[PASS] test_flashSwap_WBTC() (gas: 244872)
Logs:
  Usdt balance before test: 0
  Wbtc balance before test: 0
  Reverted with reason: profit = 0

[PASS] test_flashswap_USDT() (gas: 248728)
Logs:
  Usdt balance before test: 0
  Wbtc balance before test: 0
  Reverted with reason: profit = 0

Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 14.58ms (7.34ms CPU time)
```

### Hardhat testing 👷

**Run the local node**

You can go to etherscan.io if you want to get a more recent block number.

```bash
yarn hardhat node --fork FORK_URL --fork-block-number 20066221 --network hardhat
```

Split the terminal and deploy flashSwapV3.sol to the forked mainnet:
```bash
yarn hardhat ignition deploy ignition/modules/igniteFlashSwap.js --network localhost
```
**IF YOU GET AN ERROR** - delete the deployments folder for 31337 in the ignition folder, then run ```yarn hardhat clean```. Then run the ignition command above again.

**Unit tests** - For all the dependincies for the dualArbScan script.
```bash
yarn hardhat test test/unit/arbBot.unit.test.js --network localhost
```

**Integration test** - for the dualArbScan script itself
```bash
yarn hardhat test test/integration/arbBot.int.test.js --network localhost
```

## To Run

**getPools.js**

Run this first to get the pools above the liquidity threshhold, which you can change in the query itself.

```javascript
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
          token0_in: ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1",           "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", "0x912ce59144191c1204e64559fe8253a0e49e6548"]
          token1_in: ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1", "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", "0x912ce59144191c1204e64559fe8253a0e49e6548"]
          volumeUSD_gte: 500000,
          totalValueLockedUSD_gt: 1000000,
          id_not: "0x14af1804dbbf7d621ecc2901eef292a24a0260ea"
        }
        first:30,
        orderBy: totalValueLockedUSD,
        orderDirection: desc
```

Currently it will get any pools that include the tokens WETH, WBTC, ARB and USDT, with an amount locked in USD greater than 1,000,000 USD

As it is right now, outputs 9 pools.


```bash
yarn hardhat run src/utils/getPools.js
```

poolInformation returns the tokenInfo object that includes tokenAmountsIn, profitThreshhold and the token price in usd.

```
  Token Info:  {
  WBTC: {
    amountIn: 166903n,
    profitThreshold: 1669n,
    priceInUsd: 59914.82248207332
  },
  WETH: {
    amountIn: 30460466625198356n,
    profitThreshold: 304604666251983n,
    priceInUsd: 3282.943798282959
  },
  USDT: {
    amountIn: 100107620n,
    profitThreshold: 1001076n,
    priceInUsd: 0.9989249520599842
  },
  ARB: {
    amountIn: 134395064363054137344n,
    profitThreshold: 1343950643630541373n,
    priceInUsd: 0.7440749440757773
  }
```

## Scan for Arbitrage

**dualArbScan.js** function takes a json object as defined inside **uniswapPools.json**.

Calculates all possible routes and runs **quoteExactInput()** on all of them.

This is done in batches, to save on compute units for API calls. you can toggle how big batches are and how often a batch of quotes is executed, near the top of **dualArbScan.js** by changing the following two variables:
```javascript
// Set the batch size and interval to give control over the number of promises executed per second.
const BATCH_SIZE = 5 // Number of promises to execute in each batch
// Interval between batches in milliseconds
const BATCH_INTERVAL = 8000 // Interval between batches in milliseconds
```


Then calculates wether there is an arbitrage opportunity

**IMPORTANT TO NOTE** - at current configuration, it is very possible the user could lose money, if flashswap is called. This is because the gas fee would be about 0.02$. with a 10$ input the profit threshhold is 0.10$ making the gasfee 20% of the profit threshhold. If you are going to try to run this I would highly recomend going into utilities.js and using the conversion functions to account for this in the profit calculation.

```javascript
 if (profit > profitThresholdToken)
```

This loop repeats every 88 seconds with the current configuration.

```bash
yarn hardhat run src/utils/dualArbScan.js --network arbitrum

Found 9 pools
List of pools to scan
-----------------------

WBTC/WETH - Fee tier(500)
WBTC/WETH - Amount locked in USD: 49372582.82 $ - Address: 0x2f5e87c9312fa29aed5c179e456625d79015299c
-----------------------

WETH/USDT - Fee tier(500)
WETH/USDT - Amount locked in USD: 26470899.27 $ - Address: 0x641c00a822e8b671738d32a431a4fb6074e5c79d
-----------------------

WETH/ARB - Fee tier(500)
WETH/ARB - Amount locked in USD: 15298051.98 $ - Address: 0xc6f780497a95e246eb9449f5e4770916dcd6396a
-----------------------

WBTC/WETH - Fee tier(3000)
WBTC/WETH - Amount locked in USD: 10719887.95 $ - Address: 0x149e36e72726e0bcea5c59d40df2c43f60f5a22d
-----------------------

WETH/ARB - Fee tier(3000)
WETH/ARB - Amount locked in USD: 9213728.99 $ - Address: 0x92c63d0e701caae670c9415d91c474f686298f00
-----------------------

WBTC/USDT - Fee tier(500)
WBTC/USDT - Amount locked in USD: 3560736.68 $ - Address: 0x5969efdde3cf5c0d9a88ae51e47d721096a97203
-----------------------

WETH/USDT - Fee tier(3000)
WETH/USDT - Amount locked in USD: 2603095.00 $ - Address: 0xc82819f72a9e77e2c0c3a69b3196478f44303cf4
-----------------------

WETH/ARB - Fee tier(10000)
WETH/ARB - Amount locked in USD: 2459193.76 $ - Address: 0x92fd143a8fa0c84e016c2765648b9733b0aa519e
-----------------------

WBTC/USDT - Fee tier(3000)
WBTC/USDT - Amount locked in USD: 1198369.45 $ - Address: 0x53c6ca2597711ca7a73b6921faf4031eedf71339
-----------------------
{
  WBTC: {
    address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    decimals: '8'
  },
  WETH: {
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    decimals: '18'
  },
  USDT: {
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    decimals: '6'
  },
  ARB: {
    address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
    decimals: '18'
  }
}
Token Info:  {
  WBTC: {
    amountIn: 16719n,
    profitThreshold: 167n,
    priceInUsd: 59811.84378093867
  },
  WETH: {
    amountIn: 3050381186871911n,
    profitThreshold: 30503811868719n,
    priceInUsd: 3278.278807592157
  },
  USDT: {
    amountIn: 10009675n,
    profitThreshold: 100096n,
    priceInUsd: 0.9990334034040314
  },
  ARB: {
    amountIn: 13478363823712176128n,
    profitThreshold: 134783638237121761n,
    priceInUsd: 0.7419298166152207
  }
}

Scanning 52 routes for arbitrage opportunities
 every 88 seconds

Scan run number:  1
Batch number:  1
```
