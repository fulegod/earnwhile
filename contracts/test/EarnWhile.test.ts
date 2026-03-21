import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  MockERC20,
  MockYieldProtocol,
  YieldRouter,
  EarnWhileVault,
  OrderBook,
} from "../typechain-types";

describe("EarnWhile Protocol", function () {
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let agent: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  let usdc: MockERC20;
  let weth: MockERC20;
  let mockAave: MockYieldProtocol;
  let mockCompound: MockYieldProtocol;
  let yieldRouter: YieldRouter;
  let vault: EarnWhileVault;
  let orderBook: OrderBook;

  const USDC_DECIMALS = 6;
  const WETH_DECIMALS = 18;
  const AAVE_APY = 500; // 5%
  const COMPOUND_APY = 300; // 3%

  const parseUSDC = (amount: number) => ethers.parseUnits(amount.toString(), USDC_DECIMALS);
  const parseWETH = (amount: number) => ethers.parseUnits(amount.toString(), WETH_DECIMALS);

  beforeEach(async function () {
    [owner, user, agent, feeRecipient] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20Factory.deploy("USD Coin", "USDC", USDC_DECIMALS);
    weth = await MockERC20Factory.deploy("Wrapped Ether", "WETH", WETH_DECIMALS);

    // Deploy mock yield protocols
    const MockYieldFactory = await ethers.getContractFactory("MockYieldProtocol");
    mockAave = await MockYieldFactory.deploy(AAVE_APY);
    mockCompound = await MockYieldFactory.deploy(COMPOUND_APY);

    // Deploy YieldRouter
    const YieldRouterFactory = await ethers.getContractFactory("YieldRouter");
    yieldRouter = await YieldRouterFactory.deploy();

    // Deploy Vault
    const VaultFactory = await ethers.getContractFactory("EarnWhileVault");
    vault = await VaultFactory.deploy(feeRecipient.address);

    // Deploy OrderBook
    const OrderBookFactory = await ethers.getContractFactory("OrderBook");
    orderBook = await OrderBookFactory.deploy(await vault.getAddress());

    // ─── Wire up contracts ─────────────────────────────────────────

    // Vault config
    await vault.setAgent(agent.address);
    await vault.setYieldRouter(await yieldRouter.getAddress());
    await vault.setAuthorizedCaller(await orderBook.getAddress(), true);

    // YieldRouter config
    await yieldRouter.setVault(await vault.getAddress());
    await yieldRouter.addProtocol("MockAave", await mockAave.getAddress());    // protocolId 0
    await yieldRouter.addProtocol("MockCompound", await mockCompound.getAddress()); // protocolId 1

    // OrderBook config
    await orderBook.setKeeper(agent.address);

    // Mint tokens to users
    await usdc.mint(user.address, parseUSDC(100_000));
    await weth.mint(user.address, parseWETH(100));

    // Mint tokens to mock yield protocols (so they can pay out yield)
    await usdc.mint(await mockAave.getAddress(), parseUSDC(1_000_000));
    await usdc.mint(await mockCompound.getAddress(), parseUSDC(1_000_000));
    await weth.mint(await mockAave.getAddress(), parseWETH(10_000));

    // Mint WETH to OrderBook for filling buy orders (simulating counterparty)
    await weth.mint(await orderBook.getAddress(), parseWETH(1_000));
  });

  // ═══════════════════════════════════════════════════════════════════
  // MockERC20
  // ═══════════════════════════════════════════════════════════════════

  describe("MockERC20", function () {
    it("should mint tokens correctly", async function () {
      expect(await usdc.balanceOf(user.address)).to.equal(parseUSDC(100_000));
      expect(await usdc.decimals()).to.equal(USDC_DECIMALS);
      expect(await weth.decimals()).to.equal(WETH_DECIMALS);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // MockYieldProtocol
  // ═══════════════════════════════════════════════════════════════════

  describe("MockYieldProtocol", function () {
    it("should accept deposits and calculate yield based on time", async function () {
      const depositAmount = parseUSDC(10_000);
      await usdc.mint(owner.address, depositAmount);
      await usdc.connect(owner).approve(await mockAave.getAddress(), depositAmount);
      await mockAave.connect(owner).deposit(await usdc.getAddress(), depositAmount);

      // Advance 365 days
      await time.increase(365 * 24 * 60 * 60);

      // 5% APY on 10,000 = 500 USDC
      const yield_ = await mockAave.calculateYield(owner.address, await usdc.getAddress());
      expect(yield_).to.be.closeTo(parseUSDC(500), parseUSDC(1)); // allow small rounding
    });

    it("should return principal + yield on withdrawal", async function () {
      const depositAmount = parseUSDC(10_000);
      await usdc.mint(owner.address, depositAmount);
      await usdc.connect(owner).approve(await mockAave.getAddress(), depositAmount);
      await mockAave.connect(owner).deposit(await usdc.getAddress(), depositAmount);

      await time.increase(365 * 24 * 60 * 60);

      const balBefore = await usdc.balanceOf(owner.address);
      await mockAave.connect(owner).withdraw(await usdc.getAddress(), depositAmount);
      const balAfter = await usdc.balanceOf(owner.address);

      const received = balAfter - balBefore;
      // Should receive ~10,500 USDC (10,000 principal + 500 yield)
      expect(received).to.be.closeTo(parseUSDC(10_500), parseUSDC(1));
    });

    it("should update APY", async function () {
      await mockAave.setAPY(800);
      expect(await mockAave.getAPY()).to.equal(800);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // YieldRouter
  // ═══════════════════════════════════════════════════════════════════

  describe("YieldRouter", function () {
    it("should return protocol info", async function () {
      const [name, addr, active] = await yieldRouter.getProtocol(0);
      expect(name).to.equal("MockAave");
      expect(addr).to.equal(await mockAave.getAddress());
      expect(active).to.be.true;
    });

    it("should return protocol rate", async function () {
      expect(await yieldRouter.getProtocolRate(0)).to.equal(AAVE_APY);
      expect(await yieldRouter.getProtocolRate(1)).to.equal(COMPOUND_APY);
    });

    it("should return the best rate", async function () {
      const [bestId, bestRate] = await yieldRouter.getBestRate(await usdc.getAddress());
      expect(bestId).to.equal(0); // Aave has higher APY
      expect(bestRate).to.equal(AAVE_APY);
    });

    it("should reject non-vault callers", async function () {
      await expect(
        yieldRouter.connect(user).depositToProtocol(0, await usdc.getAddress(), parseUSDC(100))
      ).to.be.revertedWith("YieldRouter: caller is not vault");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // EarnWhileVault
  // ═══════════════════════════════════════════════════════════════════

  describe("EarnWhileVault", function () {
    it("should allow deposits and withdrawals", async function () {
      const amount = parseUSDC(5_000);
      await usdc.connect(user).approve(await vault.getAddress(), amount);
      await vault.connect(user).deposit(await usdc.getAddress(), amount);

      const [principal, yield_, total] = await vault.getBalance(user.address, await usdc.getAddress());
      expect(principal).to.equal(amount);
      expect(yield_).to.equal(0);
      expect(total).to.equal(amount);

      await vault.connect(user).withdraw(await usdc.getAddress(), amount);
      const [p2] = await vault.getBalance(user.address, await usdc.getAddress());
      expect(p2).to.equal(0);
    });

    it("should reject zero deposits", async function () {
      await expect(
        vault.connect(user).deposit(await usdc.getAddress(), 0)
      ).to.be.revertedWith("Vault: zero amount");
    });

    it("should reject withdrawal exceeding balance", async function () {
      await expect(
        vault.connect(user).withdraw(await usdc.getAddress(), parseUSDC(1))
      ).to.be.revertedWith("Vault: insufficient balance");
    });

    it("should only allow agent to call agent functions", async function () {
      await expect(
        vault.connect(user).agentDeposit(0, await usdc.getAddress(), parseUSDC(100))
      ).to.be.revertedWith("Vault: caller is not agent");
    });

    it("should apply 10% protocol fee on yield", async function () {
      const depositAmount = parseUSDC(10_000);

      // User deposits into vault
      await usdc.connect(user).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user).deposit(await usdc.getAddress(), depositAmount);

      // Agent moves to yield protocol
      await vault.connect(agent).agentDeposit(0, await usdc.getAddress(), depositAmount);

      // Advance 365 days
      await time.increase(365 * 24 * 60 * 60);

      // Agent withdraws from yield protocol
      const feeBalBefore = await usdc.balanceOf(feeRecipient.address);
      await vault.connect(agent).agentWithdraw(0, await usdc.getAddress(), depositAmount);
      const feeBalAfter = await usdc.balanceOf(feeRecipient.address);

      // Gross yield ~ 500 USDC (5% of 10,000)
      // Protocol fee = 10% of 500 = 50 USDC
      const feeCollected = feeBalAfter - feeBalBefore;
      expect(feeCollected).to.be.closeTo(parseUSDC(50), parseUSDC(1));

      // Check fee tracking
      const totalFees = await vault.protocolFeesCollected(await usdc.getAddress());
      expect(totalFees).to.be.closeTo(parseUSDC(50), parseUSDC(1));
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // OrderBook
  // ═══════════════════════════════════════════════════════════════════

  describe("OrderBook", function () {
    it("should place a buy order and lock funds in vault", async function () {
      // User wants to buy 1 WETH at 2000 USDC each
      const price = ethers.parseUnits("2000", 18); // 2000 USDC per WETH (18 decimal price)
      const amount = parseWETH(1); // 1 WETH

      // lockAmount = amount * price / 1e18 = 1e18 * 2000e18 / 1e18 = 2000e18
      // But USDC has 6 decimals, so we need to adjust:
      // Actually the lock calculation is in raw units: (1e18 * 2000e18) / 1e18 = 2000e18
      // This is wrong for different decimals. For the hackathon, let's use matched decimals.

      // Simpler approach: use USDC-denominated amounts
      // price = 2000e6 means 2000 USDC per unit (in USDC smallest units padded to 18 dec)
      const priceInUSDC = parseUSDC(2000); // limit price in tokenPay units
      const buyAmount = ethers.parseUnits("1", 18); // 1 unit of WETH

      // lockAmount = buyAmount * priceInUSDC / 1e18 = 1e18 * 2000e6 / 1e18 = 2000e6 = 2000 USDC
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);
      expect(lockAmount).to.equal(parseUSDC(2000));

      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount);
      await orderBook.connect(user).placeBuyOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        priceInUSDC,
        buyAmount
      );

      // Check order was created
      const order = await orderBook.getOrder(0);
      expect(order.maker).to.equal(user.address);
      expect(order.side).to.equal(0); // Buy
      expect(order.status).to.equal(0); // Active

      // Check vault balance
      const [principal] = await vault.getBalance(user.address, await usdc.getAddress());
      expect(principal).to.equal(lockAmount);
    });

    it("should cancel order and return funds", async function () {
      const priceInUSDC = parseUSDC(2000);
      const buyAmount = ethers.parseUnits("1", 18);
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);

      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount);
      await orderBook.connect(user).placeBuyOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        priceInUSDC,
        buyAmount
      );

      const balBefore = await usdc.balanceOf(user.address);
      await orderBook.connect(user).cancelOrder(0);
      const balAfter = await usdc.balanceOf(user.address);

      expect(balAfter - balBefore).to.equal(lockAmount);

      const order = await orderBook.getOrder(0);
      expect(order.status).to.equal(2); // Cancelled
    });

    it("should return active orders for a user", async function () {
      const priceInUSDC = parseUSDC(2000);
      const buyAmount = ethers.parseUnits("1", 18);
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);

      // Place 3 orders
      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount * 3n);
      await orderBook.connect(user).placeBuyOrder(await weth.getAddress(), await usdc.getAddress(), priceInUSDC, buyAmount);
      await orderBook.connect(user).placeBuyOrder(await weth.getAddress(), await usdc.getAddress(), priceInUSDC, buyAmount);
      await orderBook.connect(user).placeBuyOrder(await weth.getAddress(), await usdc.getAddress(), priceInUSDC, buyAmount);

      // Cancel the middle one
      await orderBook.connect(user).cancelOrder(1);

      const activeOrders = await orderBook.getActiveOrders(user.address);
      expect(activeOrders.length).to.equal(2);
      expect(activeOrders[0]).to.equal(0);
      expect(activeOrders[1]).to.equal(2);
    });

    it("should fill a buy order when price condition is met", async function () {
      const priceInUSDC = parseUSDC(2000);
      const buyAmount = ethers.parseUnits("1", 18);
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);

      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount);
      await orderBook.connect(user).placeBuyOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        priceInUSDC,
        buyAmount
      );

      // Set oracle price: WETH costs 1900 USDC (below limit of 2000 → fill)
      await orderBook.setOraclePrice(await weth.getAddress(), await usdc.getAddress(), parseUSDC(1900));

      const wethBefore = await weth.balanceOf(user.address);
      await orderBook.connect(agent).fillOrder(0);
      const wethAfter = await weth.balanceOf(user.address);

      // User should receive 1 WETH
      expect(wethAfter - wethBefore).to.equal(buyAmount);

      const order = await orderBook.getOrder(0);
      expect(order.status).to.equal(1); // Filled
    });

    it("should reject fill when price condition not met", async function () {
      const priceInUSDC = parseUSDC(2000);
      const buyAmount = ethers.parseUnits("1", 18);
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);

      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount);
      await orderBook.connect(user).placeBuyOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        priceInUSDC,
        buyAmount
      );

      // Price too high (2100 > 2000 limit)
      await orderBook.setOraclePrice(await weth.getAddress(), await usdc.getAddress(), parseUSDC(2100));

      await expect(
        orderBook.connect(agent).fillOrder(0)
      ).to.be.revertedWith("OrderBook: price not met");
    });

    it("should not allow non-maker to cancel", async function () {
      const priceInUSDC = parseUSDC(2000);
      const buyAmount = ethers.parseUnits("1", 18);
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);

      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount);
      await orderBook.connect(user).placeBuyOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        priceInUSDC,
        buyAmount
      );

      await expect(
        orderBook.connect(agent).cancelOrder(0)
      ).to.be.revertedWith("OrderBook: not maker");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Full Integration Flow
  // ═══════════════════════════════════════════════════════════════════

  describe("Full Integration Flow", function () {
    it("should complete: deposit → order → yield → fill → user gets ETH + yield bonus", async function () {
      // ── Step 1: User places a buy order for 1 WETH at 2000 USDC ──
      const priceInUSDC = parseUSDC(2000);
      const buyAmount = ethers.parseUnits("1", 18);
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);

      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount);
      await orderBook.connect(user).placeBuyOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        priceInUSDC,
        buyAmount
      );

      console.log("  [1] User placed buy order: 1 WETH @ 2000 USDC");
      console.log("      Locked:", ethers.formatUnits(lockAmount, USDC_DECIMALS), "USDC in vault");

      // Verify funds in vault
      let [principal] = await vault.getBalance(user.address, await usdc.getAddress());
      expect(principal).to.equal(lockAmount);

      // ── Step 2: Agent deposits idle USDC to mock Aave (5% APY) ──
      await vault.connect(agent).agentDeposit(0, await usdc.getAddress(), lockAmount);

      console.log("  [2] Agent deployed", ethers.formatUnits(lockAmount, USDC_DECIMALS), "USDC to MockAave (5% APY)");

      // ── Step 3: Time passes (30 days) ──
      const THIRTY_DAYS = 30 * 24 * 60 * 60;
      await time.increase(THIRTY_DAYS);

      console.log("  [3] 30 days pass...");

      // Check expected yield: 2000 * 0.05 * (30/365) ≈ 8.22 USDC
      const expectedGrossYield = (lockAmount * BigInt(AAVE_APY) * BigInt(THIRTY_DAYS)) / (BigInt(365 * 24 * 60 * 60) * 10000n);
      console.log("      Expected gross yield:", ethers.formatUnits(expectedGrossYield, USDC_DECIMALS), "USDC");

      // ── Step 4: Agent withdraws from yield protocol ──
      const feeBalBefore = await usdc.balanceOf(feeRecipient.address);
      await vault.connect(agent).agentWithdraw(0, await usdc.getAddress(), lockAmount);
      const feeBalAfter = await usdc.balanceOf(feeRecipient.address);

      const protocolFee = feeBalAfter - feeBalBefore;
      const netYield = expectedGrossYield - protocolFee;

      console.log("  [4] Agent withdrew from yield protocol");
      console.log("      Protocol fee (10%):", ethers.formatUnits(protocolFee, USDC_DECIMALS), "USDC");

      // Verify protocol fee is ~10% of gross yield
      expect(protocolFee).to.be.closeTo(expectedGrossYield / 10n, parseUSDC(0.01));

      // ── Step 5: Agent distributes net yield to user ──
      // The net yield stays in the vault contract. Agent credits it to the user.
      const vaultUSDCBalance = await usdc.balanceOf(await vault.getAddress());
      // Net yield = vault balance - lockAmount (the principal was returned to vault)
      const actualNetYield = vaultUSDCBalance - lockAmount;

      await vault.connect(agent).distributeYield(user.address, await usdc.getAddress(), actualNetYield);

      console.log("  [5] Agent distributed net yield:", ethers.formatUnits(actualNetYield, USDC_DECIMALS), "USDC to user");

      // Verify user has yield credited
      const [p, y, t] = await vault.getBalance(user.address, await usdc.getAddress());
      expect(p).to.equal(lockAmount);
      expect(y).to.equal(actualNetYield);
      expect(y).to.be.gt(0);

      // ── Step 6: Oracle price drops, order gets filled ──
      await orderBook.setOraclePrice(await weth.getAddress(), await usdc.getAddress(), parseUSDC(1900));

      const userWETHBefore = await weth.balanceOf(user.address);
      const userUSDCBefore = await usdc.balanceOf(user.address);

      await orderBook.connect(agent).fillOrder(0);

      const userWETHAfter = await weth.balanceOf(user.address);
      const userUSDCAfter = await usdc.balanceOf(user.address);

      console.log("  [6] Order filled at 1900 USDC/WETH");

      // User receives 1 WETH
      expect(userWETHAfter - userWETHBefore).to.equal(buyAmount);
      console.log("      User received:", ethers.formatUnits(buyAmount, WETH_DECIMALS), "WETH");

      // User also receives yield bonus (sent during fillOrder via withdrawYieldFor)
      const yieldBonus = userUSDCAfter - userUSDCBefore;
      expect(yieldBonus).to.equal(actualNetYield);
      expect(yieldBonus).to.be.gt(0);

      console.log("      User received yield bonus:", ethers.formatUnits(yieldBonus, USDC_DECIMALS), "USDC");

      // ── Verify final state ──
      const order = await orderBook.getOrder(0);
      expect(order.status).to.equal(1); // Filled

      const [finalP, finalY] = await vault.getBalance(user.address, await usdc.getAddress());
      expect(finalP).to.equal(0); // All principal was used for the order
      expect(finalY).to.equal(0); // Yield was withdrawn

      console.log("\n  === Full flow completed successfully ===");
      console.log("  User got: 1 WETH + ~" + ethers.formatUnits(yieldBonus, USDC_DECIMALS) + " USDC yield");
      console.log("  Protocol earned: ~" + ethers.formatUnits(protocolFee, USDC_DECIMALS) + " USDC fee");
    });

    it("should handle sell order flow", async function () {
      // User sells 10 WETH at 2000 USDC each
      const price = parseUSDC(2000); // 2000 USDC per WETH
      const sellAmount = parseWETH(10);

      await weth.connect(user).approve(await orderBook.getAddress(), sellAmount);
      await orderBook.connect(user).placeSellOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        price,
        sellAmount
      );

      // Verify WETH locked in vault
      const [principal] = await vault.getBalance(user.address, await weth.getAddress());
      expect(principal).to.equal(sellAmount);

      // Set price favorable for seller (WETH price goes up to 2100 USDC)
      await orderBook.setOraclePrice(await weth.getAddress(), await usdc.getAddress(), parseUSDC(2100));

      // Mint USDC to orderbook for the payout (simulating counterparty)
      const payoutAmount = (sellAmount * price) / ethers.parseUnits("1", 18);
      await usdc.mint(await orderBook.getAddress(), payoutAmount);

      const userUSDCBefore = await usdc.balanceOf(user.address);
      await orderBook.connect(agent).fillOrder(0);
      const userUSDCAfter = await usdc.balanceOf(user.address);

      // User receives 10 * 2000 = 20,000 USDC
      expect(userUSDCAfter - userUSDCBefore).to.equal(payoutAmount);
    });

    it("should handle multiple protocols and find best rate", async function () {
      // Update Compound to have higher APY than Aave
      await mockCompound.setAPY(800); // 8%

      const [bestId, bestRate] = await yieldRouter.getBestRate(await usdc.getAddress());
      expect(bestId).to.equal(1); // Compound now has best rate
      expect(bestRate).to.equal(800);

      // Deploy to best protocol
      const depositAmount = parseUSDC(5_000);
      await usdc.connect(user).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user).deposit(await usdc.getAddress(), depositAmount);
      await vault.connect(agent).agentDeposit(1, await usdc.getAddress(), depositAmount); // Protocol 1 = Compound

      await time.increase(365 * 24 * 60 * 60); // 1 year

      const feeBalBefore = await usdc.balanceOf(feeRecipient.address);
      await vault.connect(agent).agentWithdraw(1, await usdc.getAddress(), depositAmount);
      const feeBalAfter = await usdc.balanceOf(feeRecipient.address);

      // 8% of 5000 = 400 USDC gross yield. 10% fee = 40 USDC
      const fee = feeBalAfter - feeBalBefore;
      expect(fee).to.be.closeTo(parseUSDC(40), parseUSDC(1));
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Access Control
  // ═══════════════════════════════════════════════════════════════════

  describe("Access Control", function () {
    it("should only allow owner to set agent", async function () {
      await expect(
        vault.connect(user).setAgent(user.address)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("should only allow owner to add protocols", async function () {
      await expect(
        yieldRouter.connect(user).addProtocol("Bad", user.address)
      ).to.be.revertedWithCustomError(yieldRouter, "OwnableUnauthorizedAccount");
    });

    it("should only allow owner/keeper to fill orders", async function () {
      const priceInUSDC = parseUSDC(2000);
      const buyAmount = ethers.parseUnits("1", 18);
      const lockAmount = (buyAmount * priceInUSDC) / ethers.parseUnits("1", 18);

      await usdc.connect(user).approve(await orderBook.getAddress(), lockAmount);
      await orderBook.connect(user).placeBuyOrder(
        await weth.getAddress(),
        await usdc.getAddress(),
        priceInUSDC,
        buyAmount
      );

      await orderBook.setOraclePrice(await weth.getAddress(), await usdc.getAddress(), parseUSDC(1900));

      await expect(
        orderBook.connect(user).fillOrder(0)
      ).to.be.revertedWith("OrderBook: not authorized");
    });

    it("should only allow vault to call router deposit/withdraw", async function () {
      await expect(
        yieldRouter.connect(agent).depositToProtocol(0, await usdc.getAddress(), parseUSDC(100))
      ).to.be.revertedWith("YieldRouter: caller is not vault");
    });
  });
});
