// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import {Test, console} from "forge-std/Test.sol";
import {FlashSwapV3, IUniswapV3Pool, ISwapRouter02, IERC20, IWETH9} from "../src/FlashSwapV3.sol";
import {IQuoterV2} from "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";

address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
address constant PEPE = 0x6982508145454Ce325dDbE47a25d4ec3d2311933;
address constant SWAP_ROUTER_02 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;
address constant QUOTER2 = 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6;
address constant DAI_WETH_POOL_3000 = 0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8;
address constant DAI_WETH_POOL_500 = 0x60594a405d53811d3BC4766596EFD80fd545A270;
address constant USDT_WETH_POOL_3000 = 0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36;
address constant USDT_WETH_POOL_500 = 0x11b815efB8f581194ae79006d24E0d814B7697F6;
address constant PEPE_WETH_POOL_3000 = 0x11950d141EcB863F01007AdD7D1A342041227b58;
address constant PEPE_WETH_POOL_10000 = 0xF239009A101B6B930A527DEaaB6961b6E7deC8a6;
uint24 constant FEE_0 = 3000;
uint24 constant FEE_1 = 500;
uint24 constant FEE_2 = 10000;

contract UniswapV3FlashTest is Test {
    IERC20 private constant dai = IERC20(DAI);
    IERC20 private constant pepe = IERC20(PEPE);
    IWETH9 private constant weth = IWETH9(WETH);
    ISwapRouter02 private constant router = ISwapRouter02(SWAP_ROUTER_02);
    IQuoterV2 private constant quoter = IQuoterV2(QUOTER2);
    IUniswapV3Pool private constant test1pool0 = IUniswapV3Pool(DAI_WETH_POOL_3000);
    IUniswapV3Pool private constant test1pool1 = IUniswapV3Pool(DAI_WETH_POOL_500);
    IUniswapV3Pool private constant test2pool0 = IUniswapV3Pool(PEPE_WETH_POOL_3000);
    IUniswapV3Pool private constant test2pool1 = IUniswapV3Pool(PEPE_WETH_POOL_10000);
    FlashSwapV3 private flashSwap;

    address owner = address(this);
    address account1 = address(17);

    uint256 private constant DAI_AMOUNT_IN = 100 * 1e18;
    uint256 private constant PEPE_AMOUNT_IN = 6000000 * 1e18;
  
    function setUp() public {
        vm.startPrank(owner);
        flashSwap = new FlashSwapV3();
        weth.deposit{value: 1000 * 1e18}();
        weth.approve(address(router), 1000 * 1e18);
        vm.stopPrank();

        vm.deal(account1, 1000 ether);

        // Impersonate account for setting up the test environment
        vm.startPrank(account1);

        // Get Weth tokens for account1
        weth.deposit{value: 1000 * 1e18}();
        weth.approve(address(router), 1000 * 1e18);

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
        uint256 pepeBalanceBefore = pepe.balanceOf(owner);
        console.log("Dai balance before test:", daiBalanceBefore);
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
            pool0: address(test2pool0),
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

        // vm.stopPrank();

        // uint256 finalPepeBalance = pepe.balanceOf(address(this));
        // uint256 profit = finalPepeBalance - initialPepeBalance;

        // console.log("Profit:", profit);
        // assertGt(profit, 0, "Profit should be greater than zero");
    }
}
