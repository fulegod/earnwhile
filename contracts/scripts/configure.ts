import "dotenv/config";
import { ethers } from "hardhat";

const ADDRESSES = {
  MockUSDC: "0x2D0a68a5FF3B00828cBE62C092b8250F4b20CD9a",
  MockWETH: "0x1eAB27e7BCbF5c3a3d534Fc2506cC53145B8d23e",
  MockAave: "0x5E2F0B6D5F9a13D45bbfe1CB5EfF4AA9dcc154e4",
  MockCompound: "0x3bace74c7363EFf07090b86Ba26673424dd69766",
  YieldRouter: "0x216d93A00F91f2062df30D492d23E0D8C1f01352",
  EarnWhileVault: "0xaa7E2BAE9b702612985F19eEcc8765a28c74E453",
  OrderBook: "0xF267c381485C63297E5bB85109FfD2f1C97B8F92",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Configuring with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

  const vault = await ethers.getContractAt("EarnWhileVault", ADDRESSES.EarnWhileVault);
  const orderBook = await ethers.getContractAt("OrderBook", ADDRESSES.OrderBook);
  const yieldRouter = await ethers.getContractAt("YieldRouter", ADDRESSES.YieldRouter);
  const usdc = await ethers.getContractAt("MockERC20", ADDRESSES.MockUSDC);
  const weth = await ethers.getContractAt("MockERC20", ADDRESSES.MockWETH);

  // Check what's already done
  const agent = await vault.agent();
  console.log("Agent already set:", agent !== ethers.ZeroAddress);

  // Continue from where we left off
  console.log("Setting authorized caller...");
  let tx = await vault.setAuthorizedCaller(ADDRESSES.OrderBook, true, { gasLimit: 100000 });
  await tx.wait();
  console.log("  Vault: OrderBook authorized");

  console.log("Setting vault on router...");
  tx = await yieldRouter.setVault(ADDRESSES.EarnWhileVault, { gasLimit: 100000 });
  await tx.wait();
  console.log("  Router: vault set");

  console.log("Adding MockAave protocol...");
  tx = await yieldRouter.addProtocol("MockAave", ADDRESSES.MockAave, { gasLimit: 200000 });
  await tx.wait();
  console.log("  Router: MockAave added");

  console.log("Adding MockCompound protocol...");
  tx = await yieldRouter.addProtocol("MockCompound", ADDRESSES.MockCompound, { gasLimit: 200000 });
  await tx.wait();
  console.log("  Router: MockCompound added");

  console.log("Setting keeper...");
  tx = await orderBook.setKeeper(deployer.address, { gasLimit: 100000 });
  await tx.wait();
  console.log("  OrderBook: keeper set");

  console.log("\nMinting test tokens...");
  tx = await usdc.mint(ADDRESSES.MockAave, ethers.parseUnits("10000000", 6), { gasLimit: 100000 });
  await tx.wait();
  tx = await usdc.mint(ADDRESSES.MockCompound, ethers.parseUnits("10000000", 6), { gasLimit: 100000 });
  await tx.wait();
  tx = await weth.mint(ADDRESSES.MockAave, ethers.parseUnits("10000", 18), { gasLimit: 100000 });
  await tx.wait();
  tx = await weth.mint(ADDRESSES.MockCompound, ethers.parseUnits("10000", 18), { gasLimit: 100000 });
  await tx.wait();
  tx = await usdc.mint(deployer.address, ethers.parseUnits("100000", 6), { gasLimit: 100000 });
  await tx.wait();
  tx = await weth.mint(deployer.address, ethers.parseUnits("100", 18), { gasLimit: 100000 });
  await tx.wait();
  console.log("  Tokens minted!");

  console.log("\n✅ Configuration complete!");
  console.log("Balance remaining:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
