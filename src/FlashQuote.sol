// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlashQuote is Ownable {
    // Constants for token addresses and decimals
    address constant USDT_ADDRESS = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;
    address constant WETH_ADDRESS = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address constant WBTC_ADDRESS = 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f;
    address constant ARB_ADDRESS = 0x912CE59144191C1204E64559FE8253a0e49E6548;

    uint8 constant USDT_DECIMALS = 6;
    uint8 constant WETH_DECIMALS = 18;
    uint8 constant WBTC_DECIMALS = 8;
    uint8 constant ARB_DECIMALS = 18;

    // Quoter V2 contract address
    address public immutable quoter;

    constructor(address _quoter) Ownable() {
        quoter = _quoter;
    }

    struct QuoteResult {
        uint256 amountOut;
        uint256 buyBackAmount;
        int256 profit;
        uint256 gas;
    }

    function quoteFlashSwapArbitrage(
        address tokenIn,
        address tokenOut,
        address tokenMid,
        uint24 fee0,
        uint24 fee1,
        uint256 amountIn
    ) external view returns (QuoteResult memory result) {
        // Encode the path for the first swap (tokenIn -> tokenMid)
        bytes memory path0 = abi.encodePacked(tokenIn, fee0, tokenMid);

        // Get quote for the first swap
        (result.amountOut, , , ) = IQuoterV2(quoter).quoteExactInput(path0, amountIn);

        // Encode the path for the second swap (tokenMid -> tokenIn)
        bytes memory path1 = abi.encodePacked(tokenMid, fee1, tokenIn);

        // Get quote for the second swap
        (result.buyBackAmount, , result.gas, ) = IQuoterV2(quoter).quoteExactInput(path1, result.amountOut);

        // Calculate estimated profit
        int256 normalizedAmountIn = int256(_normalize(tokenIn, amountIn));
        int256 normalizedBuyBackAmount = int256(_normalize(tokenIn, result.buyBackAmount));
        
        result.profit = normalizedBuyBackAmount - normalizedAmountIn;

        // Add base gas cost
        result.gas += 100000; // Adjust this base cost as needed
    }

    function _normalize(address token, uint256 amount) private pure returns (uint256) {
        if (token == USDT_ADDRESS) {
            return amount * 1e12; // Convert from 6 to 18 decimals
        } else if (token == WBTC_ADDRESS) {
            return amount * 1e10; // Convert from 8 to 18 decimals
        } else {
            return amount; // Already 18 decimals
        }
    }

    // Function to update quoter address if needed
    function updateQuoter(address newQuoter) external onlyOwner {
        require(newQuoter != address(0), "Invalid quoter address");
        quoter = newQuoter;
    }

    // Function to withdraw any tokens accidentally sent to the contract
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}