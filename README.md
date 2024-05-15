## Uniswap V3 Stablecoin Flashswap Arbitrage bot.

This project is broken down into 2 main parts.

**Flashswap function smart contract + Arbitrage scanner**

The idea is for the script to scan the pools for current prices and find profitable routes for profitable arbitrage.

-   Find a profitable route.
-   Is the route profitable after gas + fees?
-   Format the route for input into the flashswap function.
-   Execute Flashswap smart contract function.

The script should then calculate if the trade will be profitable before executing the flashswap function.

**To get started...**

```bash
git clone https://github.com/SimSimButDifferent/UniStablecoinFlashSwapArbBot.git

yarn

foundryup
foundry init

yarn hardhat init
```

**Set rpc url**

If you haven't already, go get a mainnet API key from Alchemy, Infura or Quicknode.

```bash
FORK_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY_
```

**Run the local node**

You can go to etherscan.io if you want to get a more recent block number.

```bash
anvil --fork-url FORK_URL --fork-block-number 19721861 --fork-chain-id 1 --chain-id 1
```

### Some commands to run

**RetrievePoolInfoUni**

Run this first to get the pools above the liquidity threshhold, which you can change in the query itself.

Currently - 100000000000

As it is right now, outputs 3 USDC/USDT pools.

```bash
yarn hardhat run src/utils/retrievePoolInfoUni.js
```

## Scan for Arbitrage

**DualArbScanStables.js** function takes a json object as defined inside **uniswapStablecoinPools.json**.

Calculates all possible routes and runs **quoteExactInput()** on all of them asyncronously.

Then calculates wether there is an arbitrage opportunity

```javascript
if (amountOut > amountIn + gasFeesUsd + ProfitThreshhold) {
    arbitrageOpportunity = true
}
```

This loop repeats every 20 seconds currently.

```bash
yarn hardhat run src/utils/DualArbScanStables.js

List of pools to scan
-----------------------

USDC/USDT - Fee tier(100) Liquidity = 70912458575.083396 - Address: 0x3416cf6c708da44db2624d63ea0aaef7113527c6

USDC/USDT - Price: 1.0003141979334498
-----------------------

USDC/USDT - Fee tier(500) Liquidity = 2694509583.371948 - Address: 0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf

USDC/USDT - Price: 1.0001893274877116
-----------------------

USDC/USDT - Fee tier(3000) Liquidity = 1922257.962926 - Address: 0xee4cf3b78a74affa38c6a926282bcd8b5952818d

USDC/USDT - Price: 1.0004035343479618
-----------------------

Scanning for arbitrage opportunities

Scan run number:  1

No arbitrage opportunity found in Route:  1

-----------------------

Route: 1
amountIn - 100.0
amountOut - 99.927524
MinimumAmountOut: 107.365228
gas estimate - 179928
gas estimate in USD - 5.365228
Path - 0xdac17f958d2ee523a2206206994597c13d831ec7,100,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,500,0xdac17f958d2ee523a2206206994597c13d831ec7

-----------------------

No arbitrage opportunity found in Route:  11

-----------------------

Route: 11
amountIn - 100.0
amountOut - 99.623642
MinimumAmountOut: 107.565222
gas estimate - 186635
gas estimate in USD - 5.565222
Path - 0xdac17f958d2ee523a2206206994597c13d831ec7,3000,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,500,0xdac17f958d2ee523a2206206994597c13d831ec7

-----------------------

No arbitrage opportunity found in Route:  5

-----------------------

Route: 5
amountIn - 100.0
amountOut - 99.952476
MinimumAmountOut: 107.367464
gas estimate - 180003
gas estimate in USD - 5.367464
Path - 0xdac17f958d2ee523a2206206994597c13d831ec7,500,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,100,0xdac17f958d2ee523a2206206994597c13d831ec7

-----------------------

No arbitrage opportunity found in Route:  10

-----------------------

Route: 10
amountIn - 100.0
amountOut - 99.666316
MinimumAmountOut: 107.564715
gas estimate - 186618
gas estimate in USD - 5.564715
Path - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,3000,0xdac17f958d2ee523a2206206994597c13d831ec7,500,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

-----------------------

No arbitrage opportunity found in Route:  9

-----------------------

Route: 9
amountIn - 100.0
amountOut - 99.675958
MinimumAmountOut: 107.566445
gas estimate - 186676
gas estimate in USD - 5.566445
Path - 0xdac17f958d2ee523a2206206994597c13d831ec7,3000,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,100,0xdac17f958d2ee523a2206206994597c13d831ec7

-----------------------

No arbitrage opportunity found in Route:  7

-----------------------

Route: 7
amountIn - 100.0
amountOut - 99.666319
MinimumAmountOut: 107.564715
gas estimate - 186618
gas estimate in USD - 5.564715
Path - 0xdac17f958d2ee523a2206206994597c13d831ec7,500,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,3000,0xdac17f958d2ee523a2206206994597c13d831ec7

-----------------------

No arbitrage opportunity found in Route:  4

-----------------------

Route: 4
amountIn - 100.0
amountOut - 99.927524
MinimumAmountOut: 107.365228
gas estimate - 179928
gas estimate in USD - 5.365228
Path - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,500,0xdac17f958d2ee523a2206206994597c13d831ec7,100,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

-----------------------

No arbitrage opportunity found in Route:  3

-----------------------

Route: 3
amountIn - 100.0
amountOut - 99.693763
MinimumAmountOut: 107.563702
gas estimate - 186584
gas estimate in USD - 5.563702
Path - 0xdac17f958d2ee523a2206206994597c13d831ec7,100,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,3000,0xdac17f958d2ee523a2206206994597c13d831ec7

-----------------------

No arbitrage opportunity found in Route:  2

-----------------------

Route: 2
amountIn - 100.0
amountOut - 99.675956
MinimumAmountOut: 107.566445
gas estimate - 186676
gas estimate in USD - 5.566445
Path - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,100,0xdac17f958d2ee523a2206206994597c13d831ec7,3000,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

-----------------------

No arbitrage opportunity found in Route:  0

-----------------------

Route: 0
amountIn - 100.0
amountOut - 99.952477
MinimumAmountOut: 107.367464
gas estimate - 180003
gas estimate in USD - 5.367464
Path - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,100,0xdac17f958d2ee523a2206206994597c13d831ec7,500,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

-----------------------

No arbitrage opportunity found in Route:  8

-----------------------

Route: 8
amountIn - 100.0
amountOut - 99.69376
MinimumAmountOut: 107.563702
gas estimate - 186584
gas estimate in USD - 5.563702
Path - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,3000,0xdac17f958d2ee523a2206206994597c13d831ec7,100,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

-----------------------

No arbitrage opportunity found in Route:  6

-----------------------

Route: 6
amountIn - 100.0
amountOut - 99.623643
MinimumAmountOut: 107.565222
gas estimate - 186635
gas estimate in USD - 5.565222
Path - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,500,0xdac17f958d2ee523a2206206994597c13d831ec7,3000,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

-----------------------
```

**Run Foundry tests**

```bash
forge test --fork-url $FORK_URL --match-path test/SimpleSwapV3Test.t.sol -vv

[⠒] Compiling...
[⠊] Compiling 1 files with 0.7.6
[⠒] Solc 0.7.6 finished in 1.84s
Compiler run successful!

Ran 4 tests for test/SimpleSwapV3Test.t.sol:SimpleSwapV3test
[PASS] test_SwapExactInputSingle_DAI() (gas: 148729)
Logs:
  amountIn 10000000000000000000000
  Dai Balance before: 10000000000000000000000
  Weth9 Balance before: 0
  amountOut 3153030882673471146
  Dai Balance after: 0
  Weth9 Balance after: 3153030882673471146

[PASS] test_SwapExactInputSingle_USDC() (gas: 178853)
Logs:
  amountIn 10000000000
  Usdc Balance before: 10000000000
  Weth9 Balance before: 0
  amountOut 3152854925396431301
  Usdc Balance after: 0
  Weth9 Balance after: 3152854925396431301

[PASS] test_setUp() (gas: 27131)
Logs:
  Dai Balance before: 10000000000000000000000
  USDC Balance before: 10000000000

[PASS] test_swapExactInputMultihop() (gas: 253298)
Logs:
  amountIn 1000000000000000000000
  Dai Balance before: 10000000000000000000000
  Weth9 Balance before: 0
  amountOut 315554466975787219
  Dai Balance after: 9000000000000000000000
  Weth9 Balance after: 315554466975787219

Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 14.17s (15.60s CPU time)

Ran 1 test suite in 14.84s (14.17s CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```
