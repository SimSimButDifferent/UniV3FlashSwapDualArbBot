// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import {Script} from "forge-std/Script.sol";
import {ArbQuote} from "../src/ArbQuote.sol";
import {IQuoterV2} from "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";

contract DeployArbQuoteV3 is Script {
    address quoter = 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6;

    function run() external returns (ArbQuote) {
        vm.startBroadcast();
        ArbQuote arbQuote = new ArbQuote(quoter);
        vm.stopBroadcast();
        return arbQuote;
    }
}
