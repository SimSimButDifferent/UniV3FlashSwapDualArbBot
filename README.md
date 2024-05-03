## Uniswap V3 testing boilerplate.

Building a functional testing environment that i can use as a clone to build any projects that use the Uniswap V3 protocol. Using the SDK and smart contracts together to build things.

**To get started...**

```bash
git clone https://github.com/SimSimButDifferent/UniswapV3Foundry.git

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

**Get a Quote**

**quoteV1(params)** function takes a pair object as defined inside **config.js**.

```bash
yarn hardhat run src/utils/quoteV1.js

Quoted Amount Out for Wrapped Ether : 3123.994209
Quoted Amount Out for Wrapped Bitcoin : 63760.640759
Quoted Amount Out for Aave Token : 86.160963
Quoted Amount Out for Curve DAO Token : 0.44082
Quoted Amount Out for Tether : 0.997499
Quoted Amount Out for Uniswap : 7.716985
Quoted Amount Out for Chainlink : 14.86376
Done in 4.82s.
```

**get Pool address**

**getPoolConstants(\_token0, \_token1, \_fee)** takes two Token objects as defined in the **constants.js**.

```bash
yarn hardhat run src/utils/getPoolConstants.js

Current pool address for Wrapped Ether / Tether is: 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36
Token0: Wrapped Ether
Token1: Tether
Current pool address for Wrapped Ether / USDC is: 0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8
Token0: Wrapped Ether
Token1: USDC
Current pool address for Aave Token / USDC is: 0xdceaf5d0E5E0dB9596A47C0c4120654e80B1d706
Token0: Aave Token
Token1: USDC
Current pool address for Wrapped Ether / Dai is: 0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8
Token0: Wrapped Ether
Token1: Dai
Done in 5.72s.
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

### Add more tokens

-   Add new token objects to **constants.js**

-   Add pairs to **config.js** file
