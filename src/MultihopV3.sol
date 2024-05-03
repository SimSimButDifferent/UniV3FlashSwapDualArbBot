// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract MultihopV3 {
    ISwapRouter public immutable swapRouter;

    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    /// @notice swapExactInputMultihop swaps a fixed amount of inputToken for a maximum possible amount of outputToken through an intermediary pool.
    /// @dev The calling address must approve this contract to spend at least `amountIn` worth of its inputToken for this function to succeed.
    /// @param amountIn The amount of inputToken to be swapped.
    /// @param path An array of token addresses and pool fees that define the pools used in the swaps.
    /// @return amountOut The amount of outputToken received after the swap.
    function swapExactInputMultihop(
        uint256 amountIn,
        address[] memory path,
        uint24[] memory fees
    ) external returns (uint256 amountOut) {
        require(path.length > 1, "Path must have at least two tokens");
        require(
            path.length == fees.length + 1,
            "Path length must match fees length + 1"
        );

        // Transfer `amountIn` of inputToken to this contract.
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            address(this),
            amountIn
        );

        // Approve the router to spend inputToken.
        TransferHelper.safeApprove(path[0], address(swapRouter), amountIn);

        // Construct the swap path dynamically.
        bytes memory swapPath = abi.encodePacked(
            path[0],
            fees[0],
            path[1],
            fees[1],
            path[2]
        );

        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: swapPath,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0
            });

        // Executes the swap.
        amountOut = swapRouter.exactInput(params);
    }
}
