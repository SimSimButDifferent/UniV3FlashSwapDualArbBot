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
    address private immutable owner;

    constructor(address quoterAddress) {
        quoter = IQuoter(quoterAddress);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function arbQuote(
        bytes memory path,
        uint256 amountIn
    ) external view onlyOwner returns (uint256 amountOut, uint256 gasEstimate) {
        // require(path.length > 1, "Path must have at least 3 entries");
        
        // Call quoteExactInput as a view function
        // decode the output to get the amountOut and gasEstimate
        (amountOut, gasEstimate) = quoter.quoteExactInput(path, amountIn);



        
        return (amountOut, gasEstimate);
    }
}
