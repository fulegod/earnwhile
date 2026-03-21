// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./YieldRouter.sol";

/**
 * @title EarnWhileVault
 * @notice Vault where users deposit ERC20 tokens when placing limit orders.
 *         An authorized AI agent can move idle funds to yield protocols via YieldRouter.
 *         Protocol fee: 10% of yield generated goes to the fee recipient (EarnWhile revenue).
 */
contract EarnWhileVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── State ────────────────────────────────────────────────────────

    /// @notice user => token => deposited balance (principal, excludes yield)
    mapping(address => mapping(address => uint256)) public balances;

    /// @notice user => token => accumulated yield (after protocol fee)
    mapping(address => mapping(address => uint256)) public yieldEarned;

    /// @notice token => total amount currently deployed in yield protocols
    mapping(address => uint256) public totalDeployedToYield;

    /// @notice Authorized agent address (AI agent)
    address public agent;

    /// @notice Yield router contract
    YieldRouter public yieldRouter;

    /// @notice Protocol fee recipient
    address public feeRecipient;

    /// @notice Protocol fee in basis points (1000 = 10%)
    uint256 public constant PROTOCOL_FEE_BPS = 1000;
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Total protocol fees collected per token
    mapping(address => uint256) public protocolFeesCollected;

    /// @notice Authorized callers that can deposit/withdraw on behalf of users (e.g., OrderBook)
    mapping(address => bool) public authorizedCallers;

    // ─── Events ───────────────────────────────────────────────────────

    event Deposited(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);
    event AgentDeposited(uint256 indexed protocolId, address indexed token, uint256 amount);
    event AgentWithdrawn(uint256 indexed protocolId, address indexed token, uint256 principal, uint256 yield_, uint256 fee);
    event AgentUpdated(address oldAgent, address newAgent);
    event YieldRouterUpdated(address oldRouter, address newRouter);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event CallerAuthorized(address caller, bool authorized);
    event YieldDistributed(address indexed user, address indexed token, uint256 yieldAmount);

    // ─── Modifiers ────────────────────────────────────────────────────

    modifier onlyAgent() {
        require(msg.sender == agent, "Vault: caller is not agent");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedCallers[msg.sender],
            "Vault: not authorized"
        );
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────

    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Vault: zero fee recipient");
        feeRecipient = _feeRecipient;
    }

    // ─── Admin ────────────────────────────────────────────────────────

    function setAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Vault: zero address");
        address old = agent;
        agent = _agent;
        emit AgentUpdated(old, _agent);
    }

    function setYieldRouter(address _router) external onlyOwner {
        require(_router != address(0), "Vault: zero address");
        address old = address(yieldRouter);
        yieldRouter = YieldRouter(_router);
        emit YieldRouterUpdated(old, _router);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Vault: zero address");
        address old = feeRecipient;
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(old, _feeRecipient);
    }

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorized(caller, authorized);
    }

    // ─── User Functions ───────────────────────────────────────────────

    /**
     * @notice Deposit ERC20 tokens into the vault
     * @param token The ERC20 token address
     * @param amount The amount to deposit
     */
    function deposit(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Vault: zero amount");
        balances[msg.sender][token] += amount;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, token, amount);
    }

    /**
     * @notice Deposit on behalf of a user (called by OrderBook)
     * @param user The user to credit
     * @param token The ERC20 token address
     * @param amount The amount to deposit
     */
    function depositFor(address user, address token, uint256 amount) external nonReentrant onlyAuthorized {
        require(amount > 0, "Vault: zero amount");
        require(user != address(0), "Vault: zero user");
        balances[user][token] += amount;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(user, token, amount);
    }

    /**
     * @notice Withdraw ERC20 tokens from the vault (principal + yield)
     * @param token The ERC20 token address
     * @param amount The amount to withdraw from principal
     */
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Vault: zero amount");
        require(balances[msg.sender][token] >= amount, "Vault: insufficient balance");

        balances[msg.sender][token] -= amount;

        // Also withdraw any accrued yield
        uint256 yield_ = yieldEarned[msg.sender][token];
        if (yield_ > 0) {
            yieldEarned[msg.sender][token] = 0;
        }

        uint256 totalWithdraw = amount + yield_;
        IERC20(token).safeTransfer(msg.sender, totalWithdraw);

        emit Withdrawn(msg.sender, token, totalWithdraw);
    }

    /**
     * @notice Withdraw on behalf of a user (called by OrderBook)
     * @param user The user to debit
     * @param token The ERC20 token address
     * @param amount The amount to withdraw from principal
     * @param to The address to send tokens to
     */
    function withdrawFor(address user, address token, uint256 amount, address to) external nonReentrant onlyAuthorized {
        require(amount > 0, "Vault: zero amount");
        require(balances[user][token] >= amount, "Vault: insufficient balance");

        balances[user][token] -= amount;
        IERC20(token).safeTransfer(to, amount);

        emit Withdrawn(user, token, amount);
    }

    /**
     * @notice Withdraw yield for a user and send to destination (called by OrderBook on cancel)
     * @param user The user whose yield to withdraw
     * @param token The token
     * @param to The address to send yield to
     * @return yield_ The yield amount sent
     */
    function withdrawYieldFor(address user, address token, address to) external nonReentrant onlyAuthorized returns (uint256 yield_) {
        yield_ = yieldEarned[user][token];
        if (yield_ > 0) {
            yieldEarned[user][token] = 0;
            IERC20(token).safeTransfer(to, yield_);
        }
    }

    // ─── Agent Functions ──────────────────────────────────────────────

    /**
     * @notice Agent moves idle vault funds to a yield protocol via the router
     * @param protocolId The yield protocol to deposit into
     * @param token The ERC20 token
     * @param amount The amount to deploy
     */
    function agentDeposit(uint256 protocolId, address token, uint256 amount) external onlyAgent nonReentrant {
        require(address(yieldRouter) != address(0), "Vault: no router set");
        require(amount > 0, "Vault: zero amount");

        totalDeployedToYield[token] += amount;

        // Approve router to pull tokens
        IERC20(token).approve(address(yieldRouter), amount);
        yieldRouter.depositToProtocol(protocolId, token, amount);

        emit AgentDeposited(protocolId, token, amount);
    }

    /**
     * @notice Agent withdraws funds from a yield protocol back to the vault
     * @param protocolId The yield protocol to withdraw from
     * @param token The ERC20 token
     * @param amount The principal amount to withdraw
     */
    function agentWithdraw(uint256 protocolId, address token, uint256 amount) external onlyAgent nonReentrant {
        require(address(yieldRouter) != address(0), "Vault: no router set");
        require(amount > 0, "Vault: zero amount");
        require(amount <= totalDeployedToYield[token], "Vault: exceeds deployed");

        // Approve router (it will transfer back principal + yield)
        IERC20(token).approve(address(yieldRouter), 0); // reset
        (uint256 principal, uint256 grossYield) = yieldRouter.withdrawFromProtocol(protocolId, token, amount);

        totalDeployedToYield[token] -= principal;

        // Protocol fee: 10% of yield
        uint256 fee = (grossYield * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 netYield = grossYield - fee;

        if (fee > 0) {
            protocolFeesCollected[token] += fee;
            IERC20(token).safeTransfer(feeRecipient, fee);
        }

        emit AgentWithdrawn(protocolId, token, principal, netYield, fee);
    }

    /**
     * @notice Distribute yield to a specific user (called by agent or owner after agent withdrawal)
     * @param user The user to receive yield
     * @param token The token
     * @param amount The net yield amount to credit
     */
    function distributeYield(address user, address token, uint256 amount) external onlyAgent {
        require(user != address(0), "Vault: zero user");
        yieldEarned[user][token] += amount;
        emit YieldDistributed(user, token, amount);
    }

    // ─── View Functions ───────────────────────────────────────────────

    /**
     * @notice Get user's total balance (principal + accrued yield)
     * @param user The user address
     * @param token The token address
     * @return principal The deposited principal
     * @return yield_ The accrued yield (after protocol fee)
     * @return total The total balance
     */
    function getBalance(address user, address token) external view returns (uint256 principal, uint256 yield_, uint256 total) {
        principal = balances[user][token];
        yield_ = yieldEarned[user][token];
        total = principal + yield_;
    }
}
