// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract SimpleSwapV3 {
    ISwapRouter public immutable swapRouter;

    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    /// @notice swapExactInputSingle swaps a fixed amount of Token0 for a maximum possible amount of Token1
    /// using the Token0/Token1 specified pool fee (500/ 3000/ 10000) pool by calling `exactInputSingle` in the swap router.
    /// @dev The calling address must approve this contract to spend at least `amountIn` worth of its Token0 for this function to succeed.
    /// @param amountIn The exact amount of Token0 that will be swapped for Token1.
    /// @return amountOut The amount of Token1 received.

    function swapExactInputSingle(
        uint256 amountIn,
        address token0,
        address token1,
        uint24 poolFee
    ) external returns (uint256 amountOut) {
        // msg.sender must approve this contract

        // Transfer the specified amount of Token0 to this contract.
        TransferHelper.safeTransferFrom(
            token0,
            msg.sender,
            address(this),
            amountIn
        );

        // Approve the router to spend Token0.
        TransferHelper.safeApprove(token0, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: token0,
                tokenOut: token1,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }
}
