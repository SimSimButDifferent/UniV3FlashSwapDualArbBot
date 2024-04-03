// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

interface IPoolAddressesProvider {
    /* Functions */

    /**
     * @notice Returns the address of the Pool proxy.
     * @return The Pool proxy address
     */
    function getPool() external view returns (address);
}

// Interface for Aave V3 Pool
interface IPool {
    /* Functions */

    /**
     * @notice Allows smartcontracts to access the liquidity of the pool within one transaction,
     * as long as the amount taken plus a fee is returned.
     * @param receiverAddress The address of the contract receiving the funds
     * @param asset The address of the asset to flash loan
     * @param amount The amount of the asset to flash loan
     * @param params The parameters for the flash loan
     * @param referralCode The referral code for the flash loan
     * @dev The receiver needs to implement the IFlashLoanReceiver interface
     * @dev The fee needs to be returned to the pool with the `flashLoan` function
     */

    function flashLoanSimple(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

interface IFlashLoanSimpleReceiver {
    /* Functions */

    /**
     * @notice Executes an operation after receiving the flash-borrowed asset
     * @dev Ensure that the contract can return the debt + premium, e.g., has
     *      enough funds to repay and has approved the Pool to pull the total amount
     * @param asset The address of the flash-borrowed asset
     * @param amount The amount of the flash-borrowed asset
     * @param premium The fee of the flash-borrowed asset
     * @param initiator The address of the flashloan initiator
     * @param params The byte-encoded params passed when initiating the flashloan
     * @return True if the execution of the operation succeeds, false otherwise
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}
