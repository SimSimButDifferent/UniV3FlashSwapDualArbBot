// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import {SimpleSwapV3, IERC20, ISwapRouter} from "../src/SingleSwapV3.sol";
import {MultihopV3} from "../src/MultihopV3.sol";
import {Test, console} from "forge-std/Test.sol";

import {StdCheats} from "forge-std/StdCheats.sol";

contract SimpleSwapV3test is StdCheats, Test {
    SimpleSwapV3 public simpleSwapV3;
    MultihopV3 public multihopV3;

    ISwapRouter swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    uint24 constant poolFeeLowest = 100;
    uint24 constant poolFeeLow = 500;
    uint24 constant poolFeeMed = 3000;
    uint24 constant poolFeeHigh = 10000;

    uint256 constant amount = 10000 * 1e18;
    uint256 constant amount6d = 10000 * 1e6;

    IERC20 public usdt = IERC20(USDT);
    IERC20 public dai = IERC20(DAI);
    IERC20 public usdc = IERC20(USDC);
    IERC20 public weth9 = IERC20(WETH9);

    address constant user = address(1);

    function setUp() external {
        simpleSwapV3 = new SimpleSwapV3(swapRouter);
        multihopV3 = new MultihopV3(swapRouter);

        deal(DAI, user, amount);
        deal(USDC, user, amount6d);
        deal(WETH9, user, 0);

        vm.prank(user);
        dai.approve(address(simpleSwapV3), type(uint256).max);
        vm.prank(user);
        usdc.approve(address(simpleSwapV3), type(uint256).max);
        vm.prank(user);
        dai.approve(address(multihopV3), type(uint256).max);
        vm.prank(user);
        usdc.approve(address(multihopV3), type(uint256).max);
    }

    function test_setUp() external view {
        console.log("Dai Balance before:", dai.balanceOf(user));
        console.log("USDC Balance before:", usdc.balanceOf(user));
        assertEq(dai.balanceOf(user), amount);
        assertEq(usdc.balanceOf(user), amount6d);
    }

    // SINGLE SWAP TESTS

    function test_SwapExactInputSingle_DAI() external {
        uint256 amountIn = 10000 * 1e18;

        assertEq(dai.balanceOf(user), amount);

        uint256 dai_before = dai.balanceOf(user);
        uint256 weth9_before = weth9.balanceOf(user);
        console.log("amountIn", amountIn);

        console.log("Dai Balance before:", dai_before);
        console.log("Weth9 Balance before:", weth9_before);

        vm.prank(user);
        uint256 amountOut = simpleSwapV3.swapExactInputSingle(
            amountIn,
            DAI,
            WETH9,
            poolFeeMed
        );

        uint256 dai_after = dai.balanceOf(user);
        uint256 weth_after = weth9.balanceOf(user);

        console.log("amountOut", amountOut);
        console.log("Dai Balance after:", dai_after);
        console.log("Weth9 Balance after:", weth_after);

        assertEq(dai_before - amountIn, dai_after);
        assertEq(weth9_before + amountOut, weth_after);
    }

    function test_SwapExactInputSingle_USDC() external {
        uint256 amountIn6d = 10000 * 1e6;

        assertEq(usdc.balanceOf(user), amount6d);

        uint256 usdc_before = usdc.balanceOf(user);
        uint256 weth9_before = weth9.balanceOf(user);
        console.log("amountIn", amountIn6d);

        console.log("Usdc Balance before:", usdc_before);
        console.log("Weth9 Balance before:", weth9_before);

        vm.prank(user);
        uint256 amountOut = simpleSwapV3.swapExactInputSingle(
            amountIn6d,
            USDC,
            WETH9,
            poolFeeMed
        );

        uint256 usdc_after = usdc.balanceOf(user);
        uint256 weth_after = weth9.balanceOf(user);

        console.log("amountOut", amountOut);
        console.log("Usdc Balance after:", usdc_after);
        console.log("Weth9 Balance after:", weth_after);

        assertEq(usdc_before - amountIn6d, usdc_after);
        assertEq(weth9_before + amountOut, weth_after);
    }

    // MULTIHOP TESTS
    function test_swapExactInputMultihop() external {
        uint256 amountIn = 1000 * 1e18;
        address[] memory path = new address[](3);
        uint24[] memory fees = new uint24[](2);

        path[0] = DAI;
        path[1] = USDC;
        path[2] = WETH9;

        fees[0] = poolFeeLow;
        fees[1] = poolFeeLow;

        assertEq(dai.balanceOf(user), amount);

        uint256 dai_before = dai.balanceOf(user);
        uint256 weth9_before = weth9.balanceOf(user);
        console.log("amountIn", amountIn);

        console.log("Dai Balance before:", dai_before);
        console.log("Weth9 Balance before:", weth9_before);

        vm.prank(user);
        uint256 amountOut = multihopV3.swapExactInputMultihop(
            amountIn,
            path,
            fees
        );

        uint256 dai_after = dai.balanceOf(user);
        uint256 weth_after = weth9.balanceOf(user);

        console.log("amountOut", amountOut);
        console.log("Dai Balance after:", dai_after);
        console.log("Weth9 Balance after:", weth_after);

        assertEq(dai_before - amountIn, dai_after);
        assertEq(weth9_before + amountOut, weth_after);
    }
}
