import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying EarnWhile contracts with account:", deployer.address);
  console.log("Network:", network.name, "| Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

  // ─── 1. Deploy Mock Tokens (only for testnet/local) ──────────────
  console.log("Deploying MockERC20 tokens...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("USD Coin (Mock)", "USDC", 6);
  await usdc.waitForDeployment();
  console.log("  MockUSDC:", await usdc.getAddress());

  const weth = await MockERC20.deploy("Wrapped Ether (Mock)", "WETH", 18);
  await weth.waitForDeployment();
  console.log("  MockWETH:", await weth.getAddress());

  // ─── 2. Deploy Mock Yield Protocols ───────────────────────────────
  console.log("\nDeploying MockYieldProtocols...");
  const MockYieldProtocol = await ethers.getContractFactory("MockYieldProtocol");

  const mockAave = await MockYieldProtocol.deploy(500); // 5% APY
  await mockAave.waitForDeployment();
  console.log("  MockAave (5% APY):", await mockAave.getAddress());

  const mockCompound = await MockYieldProtocol.deploy(300); // 3% APY
  await mockCompound.waitForDeployment();
  console.log("  MockCompound (3% APY):", await mockCompound.getAddress());

  // ─── 3. Deploy YieldRouter ────────────────────────────────────────
  console.log("\nDeploying YieldRouter...");
  const YieldRouter = await ethers.getContractFactory("YieldRouter");
  const yieldRouter = await YieldRouter.deploy();
  await yieldRouter.waitForDeployment();
  console.log("  YieldRouter:", await yieldRouter.getAddress());

  // ─── 4. Deploy EarnWhileVault ─────────────────────────────────────
  console.log("\nDeploying EarnWhileVault...");
  const feeRecipient = deployer.address; // Protocol fee goes to deployer for now
  const EarnWhileVault = await ethers.getContractFactory("EarnWhileVault");
  const vault = await EarnWhileVault.deploy(feeRecipient);
  await vault.waitForDeployment();
  console.log("  EarnWhileVault:", await vault.getAddress());

  // ─── 5. Deploy OrderBook ──────────────────────────────────────────
  console.log("\nDeploying OrderBook...");
  const OrderBook = await ethers.getContractFactory("OrderBook");
  const orderBook = await OrderBook.deploy(await vault.getAddress());
  await orderBook.waitForDeployment();
  console.log("  OrderBook:", await orderBook.getAddress());

  // ─── 6. Wire up contracts ─────────────────────────────────────────
  console.log("\nConfiguring contracts...");

  // Vault: set agent (deployer acts as agent initially), router, authorize orderbook
  await vault.setAgent(deployer.address);
  console.log("  Vault: agent set to deployer");

  await vault.setYieldRouter(await yieldRouter.getAddress());
  console.log("  Vault: yield router set");

  await vault.setAuthorizedCaller(await orderBook.getAddress(), true);
  console.log("  Vault: OrderBook authorized");

  // YieldRouter: set vault, add protocols
  await yieldRouter.setVault(await vault.getAddress());
  console.log("  Router: vault set");

  const tx1 = await yieldRouter.addProtocol("MockAave", await mockAave.getAddress());
  await tx1.wait();
  console.log("  Router: MockAave added (protocolId: 0)");

  const tx2 = await yieldRouter.addProtocol("MockCompound", await mockCompound.getAddress());
  await tx2.wait();
  console.log("  Router: MockCompound added (protocolId: 1)");

  // OrderBook: set keeper
  await orderBook.setKeeper(deployer.address);
  console.log("  OrderBook: keeper set to deployer");

  // ─── 7. Mint test tokens to mock protocols (for yield payouts) ───
  console.log("\nMinting test tokens to yield protocols...");
  await usdc.mint(await mockAave.getAddress(), ethers.parseUnits("10000000", 6));
  await usdc.mint(await mockCompound.getAddress(), ethers.parseUnits("10000000", 6));
  await weth.mint(await mockAave.getAddress(), ethers.parseUnits("10000", 18));
  await weth.mint(await mockCompound.getAddress(), ethers.parseUnits("10000", 18));
  console.log("  Minted 10M USDC and 10K WETH to each protocol");

  // Mint some tokens to deployer for testing
  await usdc.mint(deployer.address, ethers.parseUnits("100000", 6));
  await weth.mint(deployer.address, ethers.parseUnits("100", 18));
  console.log("  Minted 100K USDC and 100 WETH to deployer");

  // ─── 8. Save deployed addresses ──────────────────────────────────
  const addresses = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    feeRecipient: feeRecipient,
    contracts: {
      MockUSDC: await usdc.getAddress(),
      MockWETH: await weth.getAddress(),
      MockAave: await mockAave.getAddress(),
      MockCompound: await mockCompound.getAddress(),
      YieldRouter: await yieldRouter.getAddress(),
      EarnWhileVault: await vault.getAddress(),
      OrderBook: await orderBook.getAddress(),
    },
    protocolIds: {
      MockAave: 0,
      MockCompound: 1,
    },
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${network.name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log(`\nAddresses saved to: ${outputPath}`);

  console.log("\n════════════════════════════════════════════════");
  console.log("  EarnWhile deployment complete!");
  console.log("════════════════════════════════════════════════\n");
  console.log(JSON.stringify(addresses.contracts, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
