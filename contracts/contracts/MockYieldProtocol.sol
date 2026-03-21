// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockYieldProtocol
 * @notice Simulates a yield-generating protocol (like Aave/Compound) for hackathon demo.
 *         Tracks deposits with timestamps and calculates yield based on configurable APY and time elapsed.
 */
contract MockYieldProtocol {
    using SafeERC20 for IERC20;

    /// @notice APY in basis points (e.g., 500 = 5%)
    uint256 public apyBasisPoints;

    struct Deposit {
        uint256 amount;
        uint256 depositedAt;
    }

    /// @notice depositor => token => Deposit
    mapping(address => mapping(address => Deposit)) public deposits;

    /// @notice Total deposited per token (for accounting)
    mapping(address => uint256) public totalDeposited;

    event Deposited(address indexed depositor, address indexed token, uint256 amount);
    event Withdrawn(address indexed depositor, address indexed token, uint256 principal, uint256 yield_);
    event APYUpdated(uint256 oldAPY, uint256 newAPY);

    constructor(uint256 _apyBasisPoints) {
        apyBasisPoints = _apyBasisPoints;
    }

    /**
     * @notice Deposit tokens into the mock yield protocol
     * @param token The ERC20 token to deposit
     * @param amount The amount to deposit
     */
    function deposit(address token, uint256 amount) external {
        require(amount > 0, "MockYield: zero amount");

        // If there's an existing deposit, accrue yield first and add to principal
        Deposit storage d = deposits[msg.sender][token];
        if (d.amount > 0) {
            uint256 accruedYield = calculateYield(msg.sender, token);
            d.amount += accruedYield + amount;
            d.depositedAt = block.timestamp;
        } else {
            d.amount = amount;
            d.depositedAt = block.timestamp;
        }

        totalDeposited[token] += amount;

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, token, amount);
    }

    /**
     * @notice Withdraw tokens plus accrued yield
     * @param token The ERC20 token to withdraw
     * @param amount The principal amount to withdraw (yield is added on top)
     * @return principal The principal returned
     * @return yield_ The yield earned
     */
    function withdraw(address token, uint256 amount) external returns (uint256 principal, uint256 yield_) {
        Deposit storage d = deposits[msg.sender][token];
        require(d.amount > 0, "MockYield: no deposit");
        require(amount <= d.amount, "MockYield: insufficient balance");

        // Calculate yield proportional to withdrawal amount
        uint256 totalYield = calculateYield(msg.sender, token);
        yield_ = (totalYield * amount) / d.amount;
        principal = amount;

        // Update deposit
        if (amount == d.amount) {
            d.amount = 0;
            d.depositedAt = 0;
        } else {
            // Keep remaining with accrued yield, reset timestamp
            uint256 remainingYield = totalYield - yield_;
            d.amount = d.amount - amount + remainingYield;
            d.depositedAt = block.timestamp;
        }

        totalDeposited[token] -= amount;

        // Transfer principal + yield
        uint256 totalReturn = principal + yield_;

        // Mint extra tokens to cover yield (mock protocol has infinite liquidity)
        // In a real protocol this comes from interest/lending revenue
        // For the mock, we just need the contract to have enough balance
        IERC20(token).safeTransfer(msg.sender, totalReturn);

        emit Withdrawn(msg.sender, token, principal, yield_);
        return (principal, yield_);
    }

    /**
     * @notice Calculate accrued yield for a deposit
     * @param depositor The address that deposited
     * @param token The token deposited
     * @return yield_ The accrued yield amount
     */
    function calculateYield(address depositor, address token) public view returns (uint256 yield_) {
        Deposit memory d = deposits[depositor][token];
        if (d.amount == 0 || d.depositedAt == 0) return 0;

        uint256 timeElapsed = block.timestamp - d.depositedAt;
        // yield = principal * APY * timeElapsed / (365 days * 10000)
        // APY is in basis points, so divide by 10000
        yield_ = (d.amount * apyBasisPoints * timeElapsed) / (365 days * 10000);
    }

    /**
     * @notice Get the current APY in basis points
     * @return The APY in basis points
     */
    function getAPY() external view returns (uint256) {
        return apyBasisPoints;
    }

    /**
     * @notice Update the APY (for demo purposes)
     * @param _newAPY New APY in basis points
     */
    function setAPY(uint256 _newAPY) external {
        uint256 oldAPY = apyBasisPoints;
        apyBasisPoints = _newAPY;
        emit APYUpdated(oldAPY, _newAPY);
    }

    /**
     * @notice Get deposit info
     */
    function getDeposit(address depositor, address token) external view returns (uint256 amount, uint256 depositedAt) {
        Deposit memory d = deposits[depositor][token];
        return (d.amount, d.depositedAt);
    }
}
