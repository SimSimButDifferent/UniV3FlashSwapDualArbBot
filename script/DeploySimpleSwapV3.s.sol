// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import {Script} from "forge-std/Script.sol";
import {SimpleSwapV3} from "../src/SingleSwapV3.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract DeploySimpleSwapV3 is Script {
    ISwapRouter swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    function run() external returns (SimpleSwapV3) {
        vm.startBroadcast();
        SimpleSwapV3 simpleSwapV3 = new SimpleSwapV3(swapRouter);
        vm.stopBroadcast();
        return simpleSwapV3;
    }
}
