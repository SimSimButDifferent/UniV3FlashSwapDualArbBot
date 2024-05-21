// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import {Script} from "forge-std/Script.sol";
import {FlashSwapV3} from "../src/FlashSwapV3.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract DeployFlashSwapV3 is Script {
    ISwapRouter swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    function run() external returns (FlashSwapV3) {
        vm.startBroadcast();
        FlashSwapV3 flashSwapV3 = new FlashSwapV3();
        vm.stopBroadcast();
        return flashSwapV3;
    }
}
