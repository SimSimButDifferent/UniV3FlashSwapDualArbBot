// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./IAaveV3.sol";
import "./IUniswapV3.sol";

contract TriArbFlashBotV1 is FlashLoanSimpleReceiverBase {
    constructor(address poolAddressesProvider, address uniswapV3Factory) {
        poolAddressesProvider = poolAddressesProvider;
        uniswapV3Factory = uniswapV3Factory;
    }
}
