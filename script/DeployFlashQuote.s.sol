// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import {Script} from "forge-std/Script.sol";
import {FlashQuote} from "../src/FlashQuote.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract DeployFlashQuote is Script {
    ISwapRouter swapRouter =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    function run() external returns (FlashQuote) {
        // uint256 deployerPrivateKey = vm.envUint("BOT_PRIVATE_KEY");
        vm.startBroadcast();
        FlashQuote flashQuote = new FlashQuote(0x61fFE014bA17989E743c5F6cB21bF9697530B21e);
        vm.stopBroadcast();
        return flashQuote;
    }
}
