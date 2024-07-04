![image](https://github.com/SimSimButDifferent/L7-UniV3FlashSwapDualArbBot/assets/88177427/f4872696-36f5-429f-8cf2-70f87d911abf)

The working prototype is now on the **[arbitrum branch](https://github.com/SimSimButDifferent/L7-UniV3FlashSwapDualArbBot/tree/arbitrum)**

## Uniswap V3 Flashswap Arbitrage bot.

This project is broken down into 2 main parts.

### Flashswap function smart contract + Arbitrage scanner

The idea is for the script to scan the pools for current prices and execute flashswap arbitrage with a given amountIn.

You do this my first running **getPools.js**, which queries the [uniswapV3 subgraph](https://thegraph.com/hosted-service/subgraph/uniswap/uniswap-v3) and writes a json file to ./src/jsonPoolData/ that is an object containing all of the pools neccesary information. 

Right now it is configured to pool for pools that include WETH, USDC and USDT that have totalValueLocked of above $1,000,000. 

You can configure the query how you like, the script should still run the same way.

**Here is an overview of what the script does:**

-   Scans all routes between a given set of pools.
-   Is the route profitable after gas + fees?
-   Format the route for input into the flashswap function.
-   Execute Flashswap smart contract function and log profits.


**Created using both:**

[Foundry](https://book.getfoundry.sh/) - For testing the Smart contract, written in Solidity

[Hardhat](https://hardhat.org/) - For testing the scanner and all of it's dependencies, written in javascript.

## Installation

```bash
git clone https://github.com/SimSimButDifferent/UniStablecoinFlashSwapArbBot.git

yarn

foundryup
foundry init

yarn hardhat init
```

## Testing

**Set rpc fork url - Node provider API key (Alchemy, Infura etc)**

If you haven't already, go get a mainnet API key from [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/) or [Quicknode](https://www.quicknode.com/).

```bash
FORK_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY_
```

### Foundry testing ❤️‍🔥

**Run the local node**

You can go to etherscan.io if you want to get a more recent block number.

```bash
anvil --fork-url FORK_URL --fork-block-number 19721861 --fork-chain-id 1 --chain-id 1
```
Split the terminal and deploy flashSwapV3.sol to the forked mainnet: 🚀

```bash
forge script script/DeployFlashSwapV3.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --legacy
```
```bash
[⠒] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
0: contract FlashSwapV3 0xf42Ec71A4440F5e9871C643696DD6Dc9a38911F8

## Setting up 1 EVM.

==========================

Chain 1

Estimated gas price: 9.46125912 gwei

Estimated total gas used for script: 941528

Estimated amount required: 0.00890804037673536 ETH

==========================
##
Sending transactions [0 - 0].
⠁ [00:00:00] [###########################################################################################################################] 1/1 txes (0.0s)##
Waiting for receipts.
⠉ [00:00:01] [#######################################################################################################################] 1/1 receipts (0.0s)
##### mainnet
✅  [Success]Hash: 0x1e43c0eacc1a526993b033f2ffd16026196930a8cd8bc3eede25368eaff3645d
Contract Address: 0xf42Ec71A4440F5e9871C643696DD6Dc9a38911F8
Block: 19916364
Paid: 0.00687404942985864 ETH (726547 gas * 9.46125912 gwei)



==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
Total Paid: 0.00687404942985864 ETH (726547 gas * avg 9.46125912 gwei)
```

**Run Foundry tests**

```bash
forge test -vv --rpc-url http://127.0.0.1:8545
```
```bash
[⠒] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/FlashSwapV3Test.t.sol:UniswapV3FlashTest
[PASS] test_flashSwap_DAI() (gas: 216503)
Logs:
  Dai balance before test: 0
  Usdt balance before test: 0
  Pepe balance before test: 0
  Reverted with reason: profit = 0

[PASS] test_flashSwap_PEPE() (gas: 242244)
Logs:
  Dai balance before test: 0
  Usdt balance before test: 0
  Pepe balance before test: 0
  Profit: 2301274211079176434509738

[PASS] test_flashswap_USDT() (gas: 222453)
Logs:
  Dai balance before test: 0
  Usdt balance before test: 0
  Pepe balance before test: 0
  Reverted with reason: profit = 0

Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 120.54s (9.84s CPU time)
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
const USDC = `"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"`
const USDT = `"0xdac17f958d2ee523a2206206994597c13d831ec7"`
const WETH = `"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"`

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
          token0_in: [
            ${USDT}, ${USDC}, ${WETH}
          ]
          token1_in: [
            ${USDT}, ${USDC}, ${WETH}
          ]
          totalValueLockedUSD_gt: 1000000
        }
```

Currently it will get any pools that include the tokens WETH, USDC and USDT, with an amount locked in USD greater than 1,000,000 USD

As it is right now, outputs 10 pools.

```bash
yarn hardhat run src/utils/getPools.js
```

## Scan for Arbitrage

**dualArbScan.js** function takes a json object as defined inside **uniswapPools.json**.

Calculates all possible routes and runs **quoteExactInput()** on all of them.

This is done in batches, to save on compute units for API calls. you can toggle how big batches are and how often a batch of quotes is executed, near the top of **dualArbScan.js** by changing the following two variables:
```javascript
// Set the batch size and interval to give control over the number of promises executed per second.
const BATCH_SIZE = 10 // Number of promises to execute in each batch
// Interval between batches in milliseconds
const BATCH_INTERVAL = 8000 // Interval between batches in milliseconds
```


Then calculates wether there is an arbitrage opportunity

```javascript
if (amountOut > amountIn + gasFeesUsd + ProfitThreshhold) {
    arbitrageOpportunity = true
}
```

This loop repeats every 72 seconds with the current configuration.

```bash
yarn hardhat run src/utils/dualArbScan.js --network mainnet

Found 10 pools

WETH/USDT - Fee tier(500) - Price: 3683.979235
WETH/USDT - Amount locked in USD: 100760125.67 $ - Address: 0x11b815efb8f581194ae79006d24e0d814b7697f6
-----------------------

USDC/USDT - Fee tier(100) - Price: 1.000150
USDC/USDT - Amount locked in USD: 30193284.41 $ - Address: 0x3416cf6c708da44db2624d63ea0aaef7113527c6
-----------------------

WETH/USDT - Fee tier(3000) - Price: 3676.444186
WETH/USDT - Amount locked in USD: 230225576.56 $ - Address: 0x4e68ccd3e89f51c3074ca5072bbac773960dfa36
-----------------------

USDC/USDT - Fee tier(500) - Price: 1.000596
USDC/USDT - Amount locked in USD: 12786375.87 $ - Address: 0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf
-----------------------

USDC/WETH - Fee tier(10000) - Price: 3681.791061
USDC/WETH - Amount locked in USD: 14977472.77 $ - Address: 0x7bea39867e4169dbe237d55c8242a8f2fcdcc387
-----------------------

USDC/WETH - Fee tier(500) - Price: 3683.627422
USDC/WETH - Amount locked in USD: 522066599.23 $ - Address: 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640
-----------------------

USDC/WETH - Fee tier(3000) - Price: 3682.603332
USDC/WETH - Amount locked in USD: 393639206.66 $ - Address: 0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8
-----------------------

WETH/USDT - Fee tier(10000) - Price: 3649.355457
WETH/USDT - Amount locked in USD: 4344656.51 $ - Address: 0xc5af84701f98fa483ece78af83f11b6c38aca71d
-----------------------

WETH/USDT - Fee tier(100) - Price: 3682.322619
WETH/USDT - Amount locked in USD: 4477751.18 $ - Address: 0xc7bbec68d12a0d1830360f8ec58fa599ba1b0e9b
-----------------------

USDC/WETH - Fee tier(100) - Price: 3691.331420
USDC/WETH - Amount locked in USD: 1605078.75 $ - Address: 0xe0554a476a092703abdb3ef35c80e0d76d32939f
-----------------------

Scanning 84 routes for arbitrage opportunities
 every 72 seconds

Scan run number:  1
Batch number:  1
```
