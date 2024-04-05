// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract FlashSwap {
    struct FlashCallbackData {
        uint256 amount0;
        uint256 amount1;
        address caller;
    }

    IUniswapV3Pool private immutable pool;
    IERC20 private immutable token0;
    IERC20 private immutable token1;
    ISwapRouter private immutable uniswapV3Router;

    constructor(address _pool) {
        pool = IUniswapV3Pool(_pool);
        token0 = IERC20(pool.token0());
        token1 = IERC20(pool.token1());
        uniswapV3Router = ISwapRouter(
            0xE592427A0AEce92De3Edee1F18E0157C05861564
        );
    }

    function flash(uint256 amount0, uint256 amount1) external {
        bytes memory data = abi.encode(
            FlashCallbackData({
                amount0: amount0,
                amount1: amount1,
                caller: msg.sender
            })
        );
        if (amount0 > 0)
            token0.approve(address(uniswapV3Router), ((amount0 * 100) / 997)); //amount multiplied by 1.03
        if (amount1 > 0)
            token1.approve(address(uniswapV3Router), ((amount1 * 100) / 997)); //amount multiplied by 1.03

        pool.flash(address(this), amount0, amount1, data);
    }

    function uniswapV3FlashCallback(
        // Pool fee x amount requested
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external {
        require(
            msg.sender == address(pool),
            "UniswapV3FlashSwap: Unauthorized"
        );

        FlashCallbackData memory decodedData = abi.decode(
            data,
            (FlashCallbackData)
        );

        // Write custom code here

        // Transfer fees to caller
        if (fee0 > 0) {
            token0.transferFrom(decodedData.caller, address(this), fee0);
        }
        if (fee1 > 0) {
            token1.transferFrom(decodedData.caller, address(this), fee1);
        }

        // Repay borrowed amount + fee
        if (fee0 > 0) {
            token0.transfer(address(pool), decodedData.amount0 + fee0);
        }
        if (fee1 > 0) {
            token1.transfer(address(pool), decodedData.amount1 + fee1);
        }
    }
}

interface IUniswapV3Pool {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function flash(
        address recipient,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external;
}
