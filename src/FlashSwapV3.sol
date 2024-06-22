// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/external/IWETH9.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// EXAMPLE swap
// DAI / WETH 0.3% swap fee (2000 DAI / WETH)
// DAI / WETH 0.05% swap fee (2100 DAI / WETH)
// 1. Flash swap on pool0 (receive WETH (tokenOut))
// 2. Swap on pool1 (WETH -> DAI)
// 3. Send DAI to pool0
// profit = DAI received from pool1 - DAI repaid to pool0

// Constant Variables
/**
* @dev Token addresses and decimals hardcoded to save on API calls and gas.
*/ 
address constant SWAP_ROUTER_02 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;

address constant USDT_ADDRESS = 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9;
address constant USDC_ADDRESS = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
address constant BRIDGED_USDC_ADDRESS = 0xff970a61a04b1ca14834a43f5de4533ebddb5cc8;
address constant WETH_ADDRESS = 0x82af49447d8a07e3bd95bd0d56f35241523fbab1;
address constant WBTC_ADDRESS = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f;
address constant GMX_ADDRESS = 0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a;
address constant ARB_ADDRESS = 0x912ce59144191c1204e64559fe8253a0e49e6548;
address constant PENDLE_ADDRESS = 0x808507121B80c02388fAd14726482e061B8da827;

uint16 constant USDT_DECIMALS = 6;
uint16 constant USDC_DECIMALS = 6;
uint16 constant BRIDGED_USDC_DECIMALS = 6;
uint16 constant WETH_DECIMALS = 18;
uint16 constant WBTC_DECIMALS = 8;
uint16 constant GMX_DECIMALS = 18;
uint16 constant ARB_DECIMALS = 18;
uint16 constant PENDLE_DECIMALS = 18;

contract FlashSwapV3 is ReentrancyGuard {
    /* Events */
    event FlashSwapExecuted(address indexed caller, uint256 profit);

    /* State Variables */
    address private immutable owner;
    ISwapRouter02 constant router = ISwapRouter02(SWAP_ROUTER_02);

    // Profit tracking
    uint256 private UsdtProfit;
    uint256 private UsdcProfit;
    uint256 private BridgedUsdcProfit;
    uint256 private WethProfit;
    uint256 private WbtcProfit;
    uint256 private GmxProfit;
    uint256 private ArbProfit;
    uint256 private PendleProfit;

    address private tokenInAddress;

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

    /* Functions */

    /**
     * @notice Execute a flash swap
     * @param pool0 Address of the pool to flash swap and borrow tokens from
     * @param fee1 Fee of the pool1 to be used in callback function
     * @param tokenIn Address of the tokenIn
     * @param tokenOut Address of the token Out to receive flashloan
     * @param amountIn Amount of tokenIn to borrow
     * @param amountOutMin Minimum amount of tokenOut to receive
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

        // Encode data for uniswapV3callback function (where the loaned tokens are swapped back)
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
        @param amountSpecified the amount of tokenOut being borrowed
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
        IERC20(tokenIn).approve(address(router), amountIn);

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

    // Approve tokens for swap - tokenOut for tokenIn
    IERC20(tokenOut).approve(address(router), amountOut);

    // Swap tokenOut for tokenIn
    uint256 buyBackAmount = _swap({
        tokenIn: tokenOut,
        tokenOut: tokenIn,
        fee: fee1,
        amountIn: amountOut,
        amountOutMin: amountOutMin
    });

    // Normalize amounts to 18 decimals to calculate profit
    uint256 normalizedAmountIn = _normalize(tokenIn, amountIn);
    uint256 normalizedBuyBackAmount = _normalize(tokenIn, buyBackAmount);

    // Calculate profit
    uint256 profit = (normalizedBuyBackAmount > normalizedAmountIn) ? normalizedBuyBackAmount - normalizedAmountIn : 0;

    require(profit > 0, "profit = 0");
    if (tokenIn == USDT_ADDRESS) {
        UsdtProfit += profit;
    } else if (tokenIn == USDC_ADDRESS) {
        UsdcProfit += profit;
    } else if (tokenIn == BRIDGED_USDC_ADDRESS) {
        BridgedUsdcProfit += profit;
    } else if (tokenIn == WBTC_ADDRESS) {
        WbtcProfit += profit;
    } else if (tokenIn == GMX_ADDRESS) {
        GmxProfit += profit;
    } else if (tokenIn == ARB_ADDRESS) {
        ArbProfit += profit;
    } else if (tokenIn == PENDLE_ADDRESS) {
        PendleProfit += profit;
    } else {
        WethProfit += profit;
    }
    
    // Repay pool 0
    IERC20(tokenIn).transfer(pool0, amountIn);
    IERC20(tokenIn).transfer(caller, profit);

    emit FlashSwapExecuted(caller, profit);
}

// Normalize token amounts to 18 decimals
function _normalize(address token, uint256 amount) private pure returns (uint256) {
    if (token == USDT_ADDRESS || token == USDC_ADDRESS || token == BRIDGED_USDC_ADDRESS) {
        return amount * 1e12; // Convert from 6 to 18 decimals
    } else if (token == WBTC_ADDRESS) {
        return amount * 1e10; // Convert from 8 to 18 decimals
    } else {
        return amount; // Already 18 decimals
    }
}

    // Getter Functions
    function getWethProfit() public view returns (uint256) {
        return WethProfit;
    }
    function getUsdtProfit() public view returns (uint256) {
        return UsdtProfit;
    }
    function getUsdcProfit() public view returns (uint256) {
        return UsdcProfit;
    }
    function getBridgedUsdcProfit() public view returns (uint256) {
        return BridgedUsdcProfit;
    }
    function getWbtcProfit() public view returns (uint256) {
        return WbtcProfit;
    }
    function getGmxProfit() public view returns (uint256) {
        return GmxProfit;
    }
    function getArbProfit() public view returns (uint256) {
        return ArbProfit;
    }
    function getPendleProfit() public view returns (uint256) {
        return PendleProfit;
    }
    function getOwner() public view returns (address) {
        return owner;


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
