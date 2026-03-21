// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./MockYieldProtocol.sol";

/**
 * @title YieldRouter
 * @notice Routes funds to yield protocols (Aave, Compound, etc. — mocked for hackathon).
 *         Abstracts each protocol's interface behind a unified API.
 */
contract YieldRouter is Ownable {
    using SafeERC20 for IERC20;

    struct Protocol {
        string name;
        address protocolAddress;
        bool active;
    }

    /// @notice protocolId => Protocol
    mapping(uint256 => Protocol) public protocols;
    uint256 public protocolCount;

    /// @notice Only vault can call deposit/withdraw
    address public vault;

    event ProtocolAdded(uint256 indexed protocolId, string name, address protocolAddress);
    event ProtocolToggled(uint256 indexed protocolId, bool active);
    event DepositedToProtocol(uint256 indexed protocolId, address indexed token, uint256 amount);
    event WithdrawnFromProtocol(uint256 indexed protocolId, address indexed token, uint256 principal, uint256 yield_);
    event VaultUpdated(address oldVault, address newVault);

    modifier onlyVault() {
        require(msg.sender == vault, "YieldRouter: caller is not vault");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Set the vault address
     * @param _vault The EarnWhileVault address
     */
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "YieldRouter: zero address");
        address oldVault = vault;
        vault = _vault;
        emit VaultUpdated(oldVault, _vault);
    }

    /**
     * @notice Register a new yield protocol
     * @param name Human-readable name
     * @param protocolAddress The protocol contract address
     * @return protocolId The assigned protocol ID
     */
    function addProtocol(string calldata name, address protocolAddress) external onlyOwner returns (uint256 protocolId) {
        require(protocolAddress != address(0), "YieldRouter: zero address");
        protocolId = protocolCount;
        protocols[protocolId] = Protocol({
            name: name,
            protocolAddress: protocolAddress,
            active: true
        });
        protocolCount++;
        emit ProtocolAdded(protocolId, name, protocolAddress);
    }

    /**
     * @notice Toggle a protocol's active status
     */
    function toggleProtocol(uint256 protocolId, bool active) external onlyOwner {
        require(protocolId < protocolCount, "YieldRouter: invalid protocol");
        protocols[protocolId].active = active;
        emit ProtocolToggled(protocolId, active);
    }

    /**
     * @notice Deposit tokens into a yield protocol
     * @param protocolId The protocol to deposit into
     * @param token The ERC20 token
     * @param amount The amount to deposit
     */
    function depositToProtocol(uint256 protocolId, address token, uint256 amount) external onlyVault {
        Protocol memory p = protocols[protocolId];
        require(p.active, "YieldRouter: protocol not active");
        require(amount > 0, "YieldRouter: zero amount");

        // Transfer tokens from vault to this contract, then approve and deposit
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(p.protocolAddress, amount);

        MockYieldProtocol(p.protocolAddress).deposit(token, amount);

        emit DepositedToProtocol(protocolId, token, amount);
    }

    /**
     * @notice Withdraw tokens from a yield protocol
     * @param protocolId The protocol to withdraw from
     * @param token The ERC20 token
     * @param amount The principal amount to withdraw
     * @return principal The principal withdrawn
     * @return yield_ The yield earned
     */
    function withdrawFromProtocol(uint256 protocolId, address token, uint256 amount) external onlyVault returns (uint256 principal, uint256 yield_) {
        Protocol memory p = protocols[protocolId];
        require(p.active, "YieldRouter: protocol not active");
        require(amount > 0, "YieldRouter: zero amount");

        (principal, yield_) = MockYieldProtocol(p.protocolAddress).withdraw(token, amount);

        // Transfer everything back to the vault
        uint256 totalReturn = principal + yield_;
        IERC20(token).safeTransfer(msg.sender, totalReturn);

        emit WithdrawnFromProtocol(protocolId, token, principal, yield_);
    }

    /**
     * @notice Get the current APY for a protocol in basis points
     * @param protocolId The protocol ID
     * @return APY in basis points
     */
    function getProtocolRate(uint256 protocolId) external view returns (uint256) {
        require(protocolId < protocolCount, "YieldRouter: invalid protocol");
        return MockYieldProtocol(protocols[protocolId].protocolAddress).getAPY();
    }

    /**
     * @notice Find the protocol with the best yield rate for a token
     * @return bestProtocolId The protocol ID with highest APY
     * @return bestRate The highest APY in basis points
     */
    function getBestRate(address /* token */) external view returns (uint256 bestProtocolId, uint256 bestRate) {
        bestRate = 0;
        bestProtocolId = 0;
        for (uint256 i = 0; i < protocolCount; i++) {
            if (!protocols[i].active) continue;
            uint256 rate = MockYieldProtocol(protocols[i].protocolAddress).getAPY();
            if (rate > bestRate) {
                bestRate = rate;
                bestProtocolId = i;
            }
        }
    }

    /**
     * @notice Get protocol info
     */
    function getProtocol(uint256 protocolId) external view returns (string memory name, address protocolAddress, bool active) {
        require(protocolId < protocolCount, "YieldRouter: invalid protocol");
        Protocol memory p = protocols[protocolId];
        return (p.name, p.protocolAddress, p.active);
    }
}
