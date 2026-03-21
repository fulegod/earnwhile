// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./EarnWhileVault.sol";

/**
 * @title OrderBook
 * @notice On-chain limit order registry for EarnWhile.
 *         Each order locks funds in the vault; idle capital earns yield via AI agent.
 *         When orders are filled or cancelled, funds (+ yield) are returned.
 */
contract OrderBook is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ────────────────────────────────────────────────────────

    enum Side { Buy, Sell }
    enum Status { Active, Filled, Cancelled }

    struct Order {
        uint256 orderId;
        address maker;
        address tokenBuy;    // token the maker wants to receive
        address tokenPay;    // token the maker is paying with (locked in vault)
        uint256 limitPrice;  // price in 18 decimals (tokenPay per tokenBuy)
        uint256 amount;      // amount of tokenBuy (for Buy) or tokenSell (for Sell)
        Side side;
        Status status;
        uint256 createdAt;
    }

    // ─── State ────────────────────────────────────────────────────────

    EarnWhileVault public vault;

    /// @notice All orders by ID
    mapping(uint256 => Order) public orders;
    uint256 public nextOrderId;

    /// @notice User's order IDs
    mapping(address => uint256[]) public userOrders;

    /// @notice Simulated oracle price: tokenA => tokenB => price (18 decimals)
    /// For hackathon demo — in production this would be Chainlink/Pyth
    mapping(address => mapping(address => uint256)) public oraclePrices;

    /// @notice Address authorized to fill orders (can be agent or keeper)
    address public keeper;

    // ─── Events ───────────────────────────────────────────────────────

    event OrderPlaced(uint256 indexed orderId, address indexed maker, Side side, address tokenBuy, address tokenPay, uint256 limitPrice, uint256 amount);
    event OrderFilled(uint256 indexed orderId, address indexed maker, uint256 executionPrice);
    event OrderCancelled(uint256 indexed orderId, address indexed maker, uint256 yieldReturned);
    event OraclePriceSet(address indexed tokenA, address indexed tokenB, uint256 price);
    event KeeperUpdated(address oldKeeper, address newKeeper);

    // ─── Constructor ──────────────────────────────────────────────────

    constructor(address _vault) Ownable(msg.sender) {
        require(_vault != address(0), "OrderBook: zero vault");
        vault = EarnWhileVault(_vault);
    }

    // ─── Admin ────────────────────────────────────────────────────────

    function setKeeper(address _keeper) external onlyOwner {
        address old = keeper;
        keeper = _keeper;
        emit KeeperUpdated(old, _keeper);
    }

    /**
     * @notice Set simulated oracle price (for hackathon demo)
     * @param tokenA Base token
     * @param tokenB Quote token
     * @param price Price of tokenA in tokenB (18 decimals)
     */
    function setOraclePrice(address tokenA, address tokenB, uint256 price) external onlyOwner {
        oraclePrices[tokenA][tokenB] = price;
        // Set inverse price as well
        if (price > 0) {
            oraclePrices[tokenB][tokenA] = (1e36) / price;
        }
        emit OraclePriceSet(tokenA, tokenB, price);
    }

    // ─── Order Placement ──────────────────────────────────────────────

    /**
     * @notice Place a buy order: "I want to buy tokenBuy, paying with tokenPay"
     * @param tokenBuy The token to buy
     * @param tokenPay The token to pay with (will be locked in vault)
     * @param price Limit price in 18 decimals (tokenPay per tokenBuy)
     * @param amount Amount of tokenBuy desired
     * @return orderId The new order ID
     */
    function placeBuyOrder(
        address tokenBuy,
        address tokenPay,
        uint256 price,
        uint256 amount
    ) external nonReentrant returns (uint256 orderId) {
        require(tokenBuy != address(0) && tokenPay != address(0), "OrderBook: zero token");
        require(price > 0 && amount > 0, "OrderBook: zero price/amount");

        // Calculate how much tokenPay to lock: amount * price / 1e18
        uint256 lockAmount = (amount * price) / 1e18;
        require(lockAmount > 0, "OrderBook: lock amount zero");

        // Transfer tokenPay from user to this contract, then deposit into vault
        IERC20(tokenPay).safeTransferFrom(msg.sender, address(this), lockAmount);
        IERC20(tokenPay).approve(address(vault), lockAmount);
        vault.depositFor(msg.sender, tokenPay, lockAmount);

        orderId = nextOrderId++;
        orders[orderId] = Order({
            orderId: orderId,
            maker: msg.sender,
            tokenBuy: tokenBuy,
            tokenPay: tokenPay,
            limitPrice: price,
            amount: amount,
            side: Side.Buy,
            status: Status.Active,
            createdAt: block.timestamp
        });
        userOrders[msg.sender].push(orderId);

        emit OrderPlaced(orderId, msg.sender, Side.Buy, tokenBuy, tokenPay, price, amount);
    }

    /**
     * @notice Place a sell order: "I want to sell tokenSell, receiving tokenReceive"
     * @param tokenSell The token to sell (will be locked in vault)
     * @param tokenReceive The token to receive
     * @param price Limit price in 18 decimals (tokenReceive per tokenSell)
     * @param amount Amount of tokenSell to sell
     * @return orderId The new order ID
     */
    function placeSellOrder(
        address tokenSell,
        address tokenReceive,
        uint256 price,
        uint256 amount
    ) external nonReentrant returns (uint256 orderId) {
        require(tokenSell != address(0) && tokenReceive != address(0), "OrderBook: zero token");
        require(price > 0 && amount > 0, "OrderBook: zero price/amount");

        // Lock tokenSell in vault
        IERC20(tokenSell).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(tokenSell).approve(address(vault), amount);
        vault.depositFor(msg.sender, tokenSell, amount);

        orderId = nextOrderId++;
        orders[orderId] = Order({
            orderId: orderId,
            maker: msg.sender,
            tokenBuy: tokenReceive,   // what maker wants to receive
            tokenPay: tokenSell,       // what maker is paying/selling
            limitPrice: price,
            amount: amount,
            side: Side.Sell,
            status: Status.Active,
            createdAt: block.timestamp
        });
        userOrders[msg.sender].push(orderId);

        emit OrderPlaced(orderId, msg.sender, Side.Sell, tokenReceive, tokenSell, price, amount);
    }

    // ─── Order Execution ──────────────────────────────────────────────

    /**
     * @notice Fill an order when the oracle price matches the limit price.
     *         For hackathon: simulates matching by checking oracle price against limit.
     *         In production: would be called by a keeper/solver network.
     * @param orderId The order to fill
     */
    function fillOrder(uint256 orderId) external nonReentrant {
        require(msg.sender == keeper || msg.sender == owner(), "OrderBook: not authorized");

        Order storage order = orders[orderId];
        require(order.status == Status.Active, "OrderBook: not active");

        // Check oracle price
        uint256 currentPrice;
        if (order.side == Side.Buy) {
            // For buy: check price of tokenBuy in tokenPay
            currentPrice = oraclePrices[order.tokenBuy][order.tokenPay];
            // Buy fills when market price <= limit price (buyer gets a good deal)
            require(currentPrice > 0 && currentPrice <= order.limitPrice, "OrderBook: price not met");

            // Calculate locked amount
            uint256 lockedAmount = (order.amount * order.limitPrice) / 1e18;

            // Withdraw tokenPay from vault (maker's locked funds)
            vault.withdrawFor(order.maker, order.tokenPay, lockedAmount, address(this));

            // Simulate: give maker the tokenBuy they wanted
            // In production, the counterparty/solver provides these tokens
            // For hackathon demo, we assume tokens are available in this contract
            IERC20(order.tokenBuy).safeTransfer(order.maker, order.amount);

        } else {
            // For sell: check price of tokenPay(tokenSell) in tokenBuy(tokenReceive)
            currentPrice = oraclePrices[order.tokenPay][order.tokenBuy];
            // Sell fills when market price >= limit price (seller gets a good deal)
            require(currentPrice > 0 && currentPrice >= order.limitPrice, "OrderBook: price not met");

            // Withdraw tokenSell from vault
            vault.withdrawFor(order.maker, order.tokenPay, order.amount, address(this));

            // Calculate and send tokenReceive to maker
            uint256 receiveAmount = (order.amount * order.limitPrice) / 1e18;
            IERC20(order.tokenBuy).safeTransfer(order.maker, receiveAmount);
        }

        // Also send any yield earned while order was active
        vault.withdrawYieldFor(order.maker, order.tokenPay, order.maker);

        order.status = Status.Filled;

        emit OrderFilled(orderId, order.maker, currentPrice);
    }

    /**
     * @notice Cancel an active order and return funds + yield to maker
     * @param orderId The order to cancel
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == Status.Active, "OrderBook: not active");
        require(order.maker == msg.sender, "OrderBook: not maker");

        // Calculate locked amount
        uint256 lockedAmount;
        if (order.side == Side.Buy) {
            lockedAmount = (order.amount * order.limitPrice) / 1e18;
        } else {
            lockedAmount = order.amount;
        }

        // Withdraw principal from vault back to maker
        vault.withdrawFor(order.maker, order.tokenPay, lockedAmount, order.maker);

        // Withdraw any yield earned
        uint256 yieldReturned = vault.withdrawYieldFor(order.maker, order.tokenPay, order.maker);

        order.status = Status.Cancelled;

        emit OrderCancelled(orderId, order.maker, yieldReturned);
    }

    // ─── View Functions ───────────────────────────────────────────────

    /**
     * @notice Get all active order IDs for a user
     * @param user The user address
     * @return activeOrderIds Array of active order IDs
     */
    function getActiveOrders(address user) external view returns (uint256[] memory activeOrderIds) {
        uint256[] memory allOrders = userOrders[user];
        uint256 count = 0;

        // Count active orders
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (orders[allOrders[i]].status == Status.Active) {
                count++;
            }
        }

        // Build result array
        activeOrderIds = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (orders[allOrders[i]].status == Status.Active) {
                activeOrderIds[idx++] = allOrders[i];
            }
        }
    }

    /**
     * @notice Get full order details
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
}
