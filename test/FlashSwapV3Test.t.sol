// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import {Test, console} from "forge-std/Test.sol";
import {FlashSwapV3, IUniswapV3Pool, ISwapRouter02, IERC20, IWETH9} from "../src/FlashSwapV3.sol";
import {IQuoterV2} from "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";


address constant USDT_ADDRESS = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;
address constant WETH_ADDRESS = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
address constant WBTC_ADDRESS = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f;
address constant ARB_ADDRESS = 0x912CE59144191C1204E64559FE8253a0e49E6548;

address constant SWAP_ROUTER_02 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;
address constant QUOTER2 = 0x61fFE014bA17989E743c5F6cB21bF9697530B21e;

address constant WETH_USDT_POOL_500 = 0x641C00A822e8b671738d32a431a4Fb6074E5c79d;
address constant WETH_USDT_POOL_3000 = 0xc82819F72A9e77E2c0c3A69B3196478f44303cf4;
address constant WBTC_WETH_POOL_500 = 0x2f5e87C9312fa29aed5c179E456625D79015299c;
address constant WBTC_WETH_POOL_3000 = 0x149e36E72726e0BceA5c59d40df2c43F60f5A22D;
address constant WETH_ARB_POOL_500 = 0xC6F780497A95e246EB9449f5e4770916DCd6396A;
address constant WETH_ARB_POOL_10000 = 0x92fd143A8FA0C84e016C2765648B9733b0aa519e;


uint24 constant FEE_0 = 500;
uint24 constant FEE_1 = 3000;
uint24 constant FEE_2 = 10000;

contract UniswapV3FlashTest is Test {
    
    IWETH9 private constant weth = IWETH9(WETH_ADDRESS);
    IERC20 private constant usdt = IERC20(USDT_ADDRESS);
    IERC20 private constant wbtc = IERC20(WBTC_ADDRESS);
    IERC20 private constant arb = IERC20(ARB_ADDRESS);

    ISwapRouter02 private constant router = ISwapRouter02(SWAP_ROUTER_02);
    IQuoterV2 private constant quoter = IQuoterV2(QUOTER2);

    IUniswapV3Pool private constant test1pool0 = IUniswapV3Pool(WETH_USDT_POOL_500);
    IUniswapV3Pool private constant test1pool1 = IUniswapV3Pool(WETH_USDT_POOL_3000);
    IUniswapV3Pool private constant test2pool0 = IUniswapV3Pool(WBTC_WETH_POOL_500);
    IUniswapV3Pool private constant test2pool1 = IUniswapV3Pool(WBTC_WETH_POOL_3000);
    IUniswapV3Pool private constant test3pool0 = IUniswapV3Pool(WETH_ARB_POOL_500);
    IUniswapV3Pool private constant test3pool1 = IUniswapV3Pool(WETH_ARB_POOL_10000);
    FlashSwapV3 private flashSwap;

    address owner = address(this);
    address account0 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address account1 = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
   

    uint256 private constant USDT_AMOUNT_IN = 5 * 1e6;
    uint256 private constant WBTC_AMOUNT_IN = 16200;
    uint256 private constant ARB_AMOUNT_IN = 120 * 1e18;
   
  
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
                tokenIn: WETH_ADDRESS,
                tokenOut: USDT_ADDRESS,
                fee: FEE_0,
                recipient: account0,
                amountIn: 5 * 1e17,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
        // Create an arbitrage opportunity - make WETH cheaper on test2pool0
        router.exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: WETH_ADDRESS,
                tokenOut: WBTC_ADDRESS,
                fee: FEE_0,
                recipient: account0,
                amountIn: 5 * 1e17,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        // // Create an arbitrage opportunity - make WETH cheaper on test3pool0
        // router.exactInputSingle(
        //     ISwapRouter02.ExactInputSingleParams({
        //         tokenIn: WETH_ADDRESS,
        //         tokenOut: ARB_ADDRESS,
        //         fee: FEE_0,
        //         recipient: account0,
        //         amountIn: 500 * 1e18,
        //         amountOutMinimum: 0,
        //         sqrtPriceLimitX96: 0
        //     })
        // );

        vm.stopPrank();

        console.log("Owner address:", owner);
        console.log("Account0 address:", account0);
        console.log("Account1 address:", account1);
       
        uint256 usdtBalanceBefore = usdt.balanceOf(owner);
        console.log("Usdt balance before test:", usdtBalanceBefore);
        uint256 wbtcBalanceBefore = wbtc.balanceOf(owner);
        console.log("Wbtc balance before test:", wbtcBalanceBefore);
        // uint256 arbBalanceBefore = arb.balanceOf(owner);
        // console.log("arb balance before test:", arbBalanceBefore);
    }

    
    function test_flashswap_USDT() public {
        uint256 initialUsdtBalance = usdt.balanceOf(address(this));

        // Impersonate owner to perform the flash swap
        vm.startPrank(owner);

        try flashSwap.flashSwap({
            pool0: address(test1pool0),
            fee1: FEE_1,
            tokenIn: USDT_ADDRESS,
            tokenOut: WETH_ADDRESS,
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

    function test_flashSwap_WBTC() public {
    uint256 initialWbtcBalance = wbtc.balanceOf(address(this));

    // Impersonate owner to perform the flash swap
    vm.startPrank(owner);

    try flashSwap.flashSwap({
        pool0: address(test2pool0),
        fee1: FEE_1,
        tokenIn: WBTC_ADDRESS,
        tokenOut: WETH_ADDRESS,
        amountIn: WBTC_AMOUNT_IN,
        amountOutMin: 0
    }) {
        vm.stopPrank();

        uint256 finalWbtcBalance = wbtc.balanceOf(address(this));
        uint256 profit = finalWbtcBalance > initialWbtcBalance ? finalWbtcBalance - initialWbtcBalance : 0;

        console.log("Profit:", profit);
        assertEq(profit, flashSwap.getWbtcProfit(), "Profit should be equal to WbtcProfit");
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

    // function test_flashSwap_ARB() public {
    //     uint256 initialArbBalance = arb.balanceOf(address(this));

    //     // Impersonate owner to perform the flash swap
    //     vm.startPrank(owner);

    //     try flashSwap.flashSwap({
    //         pool0: address(test3pool0),
    //         fee1: FEE_2,
    //         tokenIn: ARB_ADDRESS,
    //         tokenOut: WETH_ADDRESS,
    //         amountIn: ARB_AMOUNT_IN,
    //         amountOutMin: 0
    //     }) {
            
    //         vm.stopPrank();

    //         uint256 finalArbBalance = arb.balanceOf(address(this));
    //         uint256 profit = finalArbBalance > initialArbBalance ? finalArbBalance - initialArbBalance : 0;

    //         console.log("Profit:", profit);
    //         assertEq(profit, flashSwap.getArbProfit(), "Profit should be equal to ArbProfit");
    //         assertGt(profit, 0, "Profit should be greater than zero");
    //     } catch Error(string memory reason) {
    //         vm.stopPrank();
    //         console.log("Reverted with reason:", reason);
    //         assertEq(reason, "profit = 0", "Expected revert reason not met");
    //     } catch (bytes memory reason) {
    //         vm.stopPrank();
    //         console.log("Reverted with reason:", string(reason));
    //         assertEq(string(reason), "profit = 0", "Expected revert reason not met");
    //     }
    // }
}
