// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;

// Interface for Uniswap V3 Factory
interface IUniswapV3Factory {
    /* Functions */

    /**
     * @notice Get the pool address for a pair of tokens with a given fee
     * @param tokenA The first token of the pair
     * @param tokenB The second token of the pair
     * @param fee The fee of the pool
     */
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool);
}

// Interface for Uniswap V3 Pool
interface IUniswapV3Pool {
    /* Functions */

    /**
     * @notice Get the current tick of the pool
     * @notice From IUniswapV3PoolState
     * @return sqrtPriceX96 The current square root price of the pool
     * @return tick The current tick of the pool
     * @return observationIndex The index of the current observation
     * @return observationCardinality The number of observations in the pool
     * @return observationCardinalityNext The number of observations in the pool after the next one
     * @return feeProtocol The fee of the pool
     * @return unlocked Whether the pool is locked
     */
    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );

    /**
     * @notice Get the current liquidity of the pool
     * @notice from IUniswapV3PoolDerivedState
     * @return tickCumuatives The current tick cumulative of the pool
     * @return secondsPerLiquidityCumulativeX128s The current seconds per liquidity cumulative of the pool
     */
    // function observe(
    //     uint32[] secondsAgos
    // )
    //     external
    //     view
    //     returns (
    //         int56[] tickCumulatives,
    //         uint160[] secondsPerLiquidityCumulativeX128s
    //     );

    // /**
    //  * @notice Swap token0 for token1, or token1 for token0
    //  * @notice from IUniswapV3PoolActions
    //  * @return amount0 The amount of token0 swapped
    //  * @return amount1 The amount of token1 swapped
    //  */
    // function swap(
    //     address recipient,
    //     bool zeroForOne,
    //     int256 amountSpecified,
    //     uint160 sqrtPriceLimitX96,
    //     bytes data
    // ) external returns (int256 amount0, int256 amount1);
}

// Interface for Uniswap V3 Quoter
interface IQuoterV2 {
    /* Functions */

    /**
     * @notice Get the amount out of a swap
     * @param path The path of the swap
     * @param amountIn The amount in of the swap
     * @return amountOut The amount out of the swap
     */
    function quoteExactInput(
        bytes memory path,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    /**
     * @notice Get the amount in of a swap
     * @param path The path of the swap
     * @param amountOut The amount out of the swap
     * @return amountIn The amount in of the swap
     */
    function quoteExactOutput(
        bytes memory path,
        uint256 amountOut
    ) external view returns (uint256 amountIn);
}
