// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/external/IWETH9.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


address constant SWAP_ROUTER_02 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;

contract FlashSwapV3 is ReentrancyGuard {
    /* Events */
    event FlashSwapExecuted(address indexed caller, uint256 profit);

    /* State Variables */
    address private immutable owner;
    ISwapRouter02 constant router = ISwapRouter02(SWAP_ROUTER_02);

    uint256 public WethProfit;
    uint256 public UsdtProfit;
    uint256 public UsdcProfit;

    uint160 private constant MIN_SQRT_RATIO = 4295128739;
    uint160 private constant MAX_SQRT_RATIO =
        1461446703485210103287273052203988822378723970342;

    /* Constructor */
    constructor() {
        owner = msg.sender;
    }

    /* Modifiers */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    // EXAMPLE swap
    // DAI / WETH 0.3% swap fee (2000 DAI / WETH)
    // DAI / WETH 0.05% swap fee (2100 DAI / WETH)
    // 1. Flash swap on pool0 (receive WETH (tokenOut))
    // 2. Swap on pool1 (WETH -> DAI)
    // 3. Send DAI to pool0
    // profit = DAI received from pool1 - DAI repaid to pool0

    /* Functions */

    /**
     * @notice Execute a flash swap
     * @param pool0 Address of the pool to flash swap and borrow tokens from
     * @param fee1 Fee of the pool1 to be used in callback function
     * @param tokenIn Address of the token to be flashloaned
     * @param tokenOut Address of the token Out
     * @param amountIn Amount of tokenIn to borrow
     */
    function flashSwap(
        address pool0,
        uint24 fee1,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external onlyOwner nonReentrant() {
        // Swap on pool 0 (flash swap)
        bool zeroForOne = tokenIn < tokenOut;
        // 0 -> 1 => sqrt price decrease
        // 1 -> 0 => sqrt price increase
        uint160 sqrtPriceLimitX96 = zeroForOne
            ? MIN_SQRT_RATIO + 1
            : MAX_SQRT_RATIO - 1;

        // Encode data for callback
        bytes memory data = abi.encode(
            msg.sender,
            pool0,
            fee1,
            tokenIn,
            tokenOut,
            amountIn,
            amountOutMin,
            zeroForOne
        );

        /**
        @notice calls swap which triggers a flashloan
        @param recipient the recipient of the loan, in this case this contract
        @param amountSpecified the amount of tokenIn being borrowed
        @param data the data to be passed to the callback function
        */
        IUniswapV3Pool(pool0).swap({
            recipient: address(this),
            zeroForOne: zeroForOne,
            amountSpecified: int256(amountIn),
            sqrtPriceLimitX96: sqrtPriceLimitX96,
            data: data
        });
    }

    /**
     * @notice Swap tokenIn for tokenOut
     * @param tokenIn Address of the token to swap
     * @param tokenOut Address of the token to receive
     * @param fee Fee of the pool to swap
     * @param amountIn Amount of tokenIn to swap
     * @param amountOutMin Minimum amount of tokenOut to receive
     * @return amountOut Amount of tokenOut received
     */
    function _swap(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMin
    ) private returns (uint256 amountOut) {
        // IERC20(tokenIn).approve(address(router), amountIn);

        ISwapRouter02.ExactInputSingleParams memory params = ISwapRouter02
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });

        amountOut = router.exactInputSingle(params);
    }

    
    /**
     * @notice Callback function for Uniswap V3 pool
     * @param amount0 Amount of token0 received
     * @param amount1 Amount of token1 received
     * @param data Data passed from flashSwap
     */
    function uniswapV3SwapCallback(
        int256 amount0,
        int256 amount1,
        bytes calldata data
    ) external {
        // Decode data
        (
            address caller,
            address pool0,
            uint24 fee1,
            address tokenIn,
            address tokenOut,
            uint256 amountIn,
            uint256 amountOutMin,
            bool zeroForOne

        ) = abi.decode(
                data,
                (address, address, uint24, address, address, uint256, uint256, bool)
            );

        uint256 amountOut = zeroForOne ? uint256(-amount1) : uint256(-amount0);

        IERC20(tokenOut).approve(address(router), amountOut);

        // pool0 -> tokenIn -> tokenOut (amountOut)
        // Swap on pool 1 (swap tokenOut -> tokenIn)
        uint256 buyBackAmount = _swap({
            tokenIn: tokenOut,
            tokenOut: tokenIn,
            fee: fee1,
            amountIn: amountOut,
            amountOutMin: amountOutMin
        });

        // Repay pool 0
        uint256 profit = buyBackAmount - amountIn;
        require(profit > 0, "profit = 0");

        

        IERC20(tokenIn).transfer(pool0, amountIn);
        IERC20(tokenIn).transfer(caller, profit);

        emit FlashSwapExecuted(caller, profit);
    }
}

interface ISwapRouter02 {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut);
}
