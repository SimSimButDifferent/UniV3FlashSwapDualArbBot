// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/external/IWETH9.sol";
import "./MultihopV3.sol";

address constant SWAP_ROUTER_02 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;

contract FlashMultihop {
    address private immutable owner;
    ISwapRouter02 constant router = ISwapRouter02(SWAP_ROUTER_02);

    uint160 private constant MIN_SQRT_RATIO = 4295128739;
    uint160 private constant MAX_SQRT_RATIO =
        1461446703485210103287273052203988822378723970342;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function flashSwap(
        address pool0,
        address[] memory path,
        uint24[] memory fees,
        uint256 amountIn
    ) external onlyOwner {
        bool zeroForOne = path[0] < path[path.length - 1];
        uint160 sqrtPriceLimitX96 = zeroForOne
            ? MIN_SQRT_RATIO + 1
            : MAX_SQRT_RATIO - 1;

        bytes memory data = abi.encode(
            msg.sender,
            pool0,
            path,
            fees,
            amountIn,
            zeroForOne
        );

        IUniswapV3Pool(pool0).swap({
            recipient: address(this),
            zeroForOne: zeroForOne,
            amountSpecified: int256(amountIn),
            sqrtPriceLimitX96: sqrtPriceLimitX96,
            data: data
        });
    }

    function _multihopSwap(
        address[] memory path,
        uint24[] memory fees,
        uint256 amountIn,
        uint256 amountOutMin
    ) private returns (uint256 amountOut) {
        IERC20(path[0]).approve(address(router), amountIn);

        bytes memory encodedPath = abi.encodePacked(path[0]);
        for (uint256 i = 0; i < fees.length; i++) {
            encodedPath = abi.encodePacked(encodedPath, fees[i], path[i + 1]);
        }

        ISwapRouter02.ExactInputParams memory params = ISwapRouter02
            .ExactInputParams({
                path: encodedPath,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: amountOutMin
            });

        amountOut = router.exactInput(params);
    }

    function uniswapV3SwapCallback(
        int256 amount0,
        int256 amount1,
        bytes calldata data
    ) external {
        (
            address caller,
            address pool0,
            address[] memory path,
            uint24[] memory fees,
            uint256 amountIn,
            bool zeroForOne
        ) = abi.decode(
                data,
                (address, address, address[], uint24[], uint256, bool)
            );

        uint256 amountOut = zeroForOne ? uint256(-amount1) : uint256(-amount0);

        uint256 buyBackAmount = _multihopSwap({
            path: path,
            fees: fees,
            amountIn: amountOut,
            amountOutMin: amountIn
        });

        uint256 profit = buyBackAmount - amountIn;
        require(profit > 0, "profit = 0");

        IERC20(path[0]).transfer(pool0, amountIn);
        IERC20(path[0]).transfer(caller, profit);
    }
}

interface ISwapRouter02 {
    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function exactInput(
        ExactInputParams calldata params
    ) external payable returns (uint256 amountOut);
}
