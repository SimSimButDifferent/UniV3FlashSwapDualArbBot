// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";

// Define an interface for the Quoter contract
interface IQuoter {
    function quoteExactInput(
        bytes memory path,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 gasEstimate);
}

contract ArbQuote {
    IQuoter public quoter;

    constructor(address quoterAddress) {
        quoter = IQuoter(quoterAddress);
    }

    function arbQuote(
        address[] memory path,
        uint24[] memory fees,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 gasEstimate) {
        require(path.length > 1, "Path must have at least two tokens");
        require(
            path.length == fees.length + 1,
            "Path length must match fees length + 1"
        );

        // Construct the swap path dynamically.
        bytes memory swapPath = abi.encodePacked(
            path[0],
            fees[0],
            path[1],
            fees[1],
            path[2]
        );

        // Call quoteExactInput as a view function
        (amountOut, gasEstimate) = quoter.quoteExactInput(swapPath, amountIn);

        return (amountOut, gasEstimate);
    }
}
