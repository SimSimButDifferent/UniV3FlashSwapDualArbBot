// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import {Test, console} from "forge-std/Test.sol";
import {FlashSwapV3, IUniswapV3Pool, ISwapRouter02, IERC20, IWETH9} from "../src/FlashSwapV3.sol";
import {IQuoterV2} from "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";

address constant USDT_ADDRESS = 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9;
address constant USDC_ADDRESS = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
address constant BRIDGED_USDC_ADDRESS = 0xff970a61a04b1ca14834a43f5de4533ebddb5cc8;
address constant WETH_ADDRESS = 0x82af49447d8a07e3bd95bd0d56f35241523fbab1;
address constant WBTC_ADDRESS = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f;
address constant GMX_ADDRESS = 0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a;
address constant ARB_ADDRESS = 0x912ce59144191c1204e64559fe8253a0e49e6548;
address constant PENDLE_ADDRESS = 0x808507121B80c02388fAd14726482e061B8da827;

address constant SWAP_ROUTER_02 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;
address constant QUOTER2 = 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6;
address constant WETH_USDC_POOL_500 = 0xc6962004f452be9203591991d15f6b388e09e8d0;
address constant WBTC_WETH_POOL_500 = 0x2f5e87c9312fa29aed5c179e456625d79015299c;
address constant WETH_USDC_POOL_500_2 = 0xc31e54c7a869b9fcbecc14363cf510d1c41fa443;
address constant WETH_GMX_POOL_10000 = 0x80a9ae39310abf666a87c743d6ebbd0e8c42158e;
address constant WETH_USDT_POOL_500 = 0x641c00a822e8b671738d32a431a4fb6074e5c79d;
address constant WETH_ARB_POOL_500 = 0xc6f780497a95e246eb9449f5e4770916dcd6396a;
address constant PENDLE_WETH_POOL_3000 = 0xdbaeb7f0dfe3a0aafd798ccecb5b22e708f7852c;

uint24 constant FEE_0 = 3000;
uint24 constant FEE_1 = 500;
uint24 constant FEE_2 = 10000;

contract UniswapV3FlashTest is Test {
    
    IERC20 private constant usdc = IERC20(USDC);
    IERC20 private constant usdt = IERC20(USDT);
    IERC20 private constant arb = IERC20(ARB);
    IWETH9 private constant weth = IWETH9(WETH);

    ISwapRouter02 private constant router = ISwapRouter02(SWAP_ROUTER_02);
    IQuoterV2 private constant quoter = IQuoterV2(QUOTER2);

    IUniswapV3Pool private constant test1pool0 = IUniswapV3Pool(DAI_WETH_POOL_3000);
    IUniswapV3Pool private constant test1pool1 = IUniswapV3Pool(DAI_WETH_POOL_500);
    IUniswapV3Pool private constant test2pool0 = IUniswapV3Pool(USDT_WETH_POOL_3000);
    IUniswapV3Pool private constant test2pool1 = IUniswapV3Pool(USDT_WETH_POOL_500);
    IUniswapV3Pool private constant test3pool0 = IUniswapV3Pool(PEPE_WETH_POOL_3000);
    IUniswapV3Pool private constant test3pool1 = IUniswapV3Pool(PEPE_WETH_POOL_10000);
    FlashSwapV3 private flashSwap;

    address owner = address(this);
    address account1 = address(17);

    uint256 private constant USDC_AMOUNT_IN = 100 * 1e18;
    uint256 private constant USDT_AMOUNT_IN = 100 * 1e6;
    uint256 private constant ARB_AMOUNT_IN = 2 * 1e18;
  
    function setUp() public {
        vm.startPrank(owner);
        flashSwap = new FlashSwapV3();
        weth.deposit{value: 1500 * 1e18}();
        weth.approve(address(router), 1500 * 1e18);
        vm.stopPrank();

        vm.deal(account1, 1500 ether);

        // Impersonate account for setting up the test environment
        vm.startPrank(account1);

        // Get Weth tokens for account1
        weth.deposit{value: 1500 * 1e18}();
        weth.approve(address(router), 1500 * 1e18);

        // Create an arbitrage opportunity - make WETH cheaper on test1pool0
        router.exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: DAI,
                fee: FEE_1,
                recipient: address(0),
                amountIn: 500 * 1e18,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        // Create an arbitrage opportunity - make WETH cheaper on test2pool0
        router.exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: USDT,
                fee: FEE_1,
                recipient: address(0),
                amountIn: 500 * 1e18,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        // Create an arbitrage opportunity - make WETH cheaper on test3pool0
        router.exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: PEPE,
                fee: FEE_0,
                recipient: address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266),
                amountIn: 500 * 1e18,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        vm.stopPrank();
        uint256 daiBalanceBefore = dai.balanceOf(owner);
        uint256 usdtBalanceBefore = usdt.balanceOf(owner);
        uint256 pepeBalanceBefore = pepe.balanceOf(owner);
       
        console.log("Dai balance before test:", daiBalanceBefore);
        console.log("Usdt balance before test:", usdtBalanceBefore);
        console.log("Pepe balance before test:", pepeBalanceBefore);
    }

    
    function test_flashSwap_DAI() public {
    uint256 initialDaiBalance = dai.balanceOf(address(this));

    // Impersonate owner to perform the flash swap
    vm.startPrank(owner);

    try flashSwap.flashSwap({
        pool0: address(test1pool0),
        fee1: FEE_1,
        tokenIn: DAI,
        tokenOut: WETH,
        amountIn: DAI_AMOUNT_IN,
        amountOutMin: 0
    }) {
        vm.stopPrank();

        uint256 finalDaiBalance = dai.balanceOf(address(this));
        uint256 profit = finalDaiBalance > initialDaiBalance ? finalDaiBalance - initialDaiBalance : 0;

        console.log("Profit:", profit);
        assertEq(profit, flashSwap.getDaiProfit(), "Profit should be equal to DaiProfit");
        assertGt(profit, 0, "Profit should be greater than zero");
    } catch Error(string memory reason) {
        vm.stopPrank();
        console.log("Reverted with reason:", reason);
        assertEq(reason, "profit = 0", "Expected revert reason not met");
    } catch (bytes memory reason) {
        vm.stopPrank();
        console.log("Reverted with reason:", string(reason));
        assertEq(string(reason), "profit = 0", "Expected revert reason not met");
    }
}
    function test_flashswap_USDT() public {
        uint256 initialUsdtBalance = usdt.balanceOf(address(this));

        // Impersonate owner to perform the flash swap
        vm.startPrank(owner);

        try flashSwap.flashSwap({
            pool0: address(test2pool0),
            fee1: FEE_1,
            tokenIn: USDT,
            tokenOut: WETH,
            amountIn: USDT_AMOUNT_IN,
            amountOutMin: 0
        }) {
            vm.stopPrank();

            uint256 finalUsdtBalance = usdt.balanceOf(address(this));
            uint256 profit = finalUsdtBalance > initialUsdtBalance ? finalUsdtBalance - initialUsdtBalance : 0;

            console.log("Profit:", profit);
            assertEq(profit, flashSwap.getUsdtProfit(), "Profit should be equal to UsdtProfit");
            assertGt(profit, 0, "Profit should be greater than zero");
        } catch Error(string memory reason) {
            vm.stopPrank();
            console.log("Reverted with reason:", reason);
            assertEq(reason, "profit = 0", "Expected revert reason not met");
        } catch (bytes memory reason) {
            vm.stopPrank();
            console.log("Reverted with reason:", string(reason));
            assertEq(string(reason), "profit = 0", "Expected revert reason not met");
        }
    }


    function test_flashSwap_PEPE() public {
        uint256 initialPepeBalance = pepe.balanceOf(address(this));

        // Impersonate owner to perform the flash swap
        vm.startPrank(owner);

        try flashSwap.flashSwap({
            pool0: address(test3pool0),
            fee1: FEE_2,
            tokenIn: PEPE,
            tokenOut: WETH,
            amountIn: PEPE_AMOUNT_IN,
            amountOutMin: 0
        }) {
            
            vm.stopPrank();

            uint256 finalPepeBalance = pepe.balanceOf(address(this));
            uint256 profit = finalPepeBalance > initialPepeBalance ? finalPepeBalance - initialPepeBalance : 0;

            console.log("Profit:", profit);
            assertEq(profit, flashSwap.getPepeProfit(), "Profit should be equal to PepeProfit");
            assertGt(profit, 0, "Profit should be greater than zero");
        } catch Error(string memory reason) {
            vm.stopPrank();
            console.log("Reverted with reason:", reason);
            assertEq(reason, "profit = 0", "Expected revert reason not met");
        } catch (bytes memory reason) {
            vm.stopPrank();
            console.log("Reverted with reason:", string(reason));
            assertEq(string(reason), "profit = 0", "Expected revert reason not met");
        }
    }
}
