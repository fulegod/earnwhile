export const CONTRACTS = {
  chainId: 43113,
  EarnWhileVault: "0xaa7E2BAE9b702612985F19eEcc8765a28c74E453" as const,
  OrderBook: "0xF267c381485C63297E5bB85109FfD2f1C97B8F92" as const,
  YieldRouter: "0x216d93A00F91f2062df30D492d23E0D8C1f01352" as const,
  MockUSDC: "0x2D0a68a5FF3B00828cBE62C092b8250F4b20CD9a" as const,
  MockWETH: "0x1eAB27e7BCbF5c3a3d534Fc2506cC53145B8d23e" as const,
  MockAave: "0x5E2F0B6D5F9a13D45bbfe1CB5EfF4AA9dcc154e4" as const,
  MockCompound: "0x3bace74c7363EFf07090b86Ba26673424dd69766" as const,
}

export const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
] as const

export const VAULT_ABI = [
  { type: "function", name: "deposit", stateMutability: "nonpayable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "getUserBalance", stateMutability: "view", inputs: [{ name: "user", type: "address" }, { name: "token", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getUserYieldEarned", stateMutability: "view", inputs: [{ name: "user", type: "address" }, { name: "token", type: "address" }], outputs: [{ type: "uint256" }] },
] as const

export const ORDERBOOK_ABI = [
  { type: "function", name: "placeBuyOrder", stateMutability: "nonpayable", inputs: [{ name: "tokenBuy", type: "address" }, { name: "tokenPay", type: "address" }, { name: "limitPrice", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "cancelOrder", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }], outputs: [] },
  { type: "function", name: "fillOrder", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }, { name: "currentPrice", type: "uint256" }], outputs: [] },
  { type: "function", name: "getActiveOrders", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "orderCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "orders", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ name: "id", type: "uint256" }, { name: "maker", type: "address" }, { name: "tokenBuy", type: "address" }, { name: "tokenPay", type: "address" }, { name: "limitPrice", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "side", type: "uint8" }, { name: "status", type: "uint8" }, { name: "createdAt", type: "uint256" }] },
  { type: "function", name: "getOrder", stateMutability: "view", inputs: [{ name: "orderId", type: "uint256" }], outputs: [{ name: "orderId", type: "uint256" }, { name: "maker", type: "address" }, { name: "tokenBuy", type: "address" }, { name: "tokenPay", type: "address" }, { name: "limitPrice", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "side", type: "uint8" }, { name: "status", type: "uint8" }, { name: "createdAt", type: "uint256" }] },
] as const

export const YIELD_ROUTER_ABI = [
  { type: "function", name: "getProtocolRate", stateMutability: "view", inputs: [{ name: "protocolId", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getBestRate", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "bestProtocolId", type: "uint256" }, { name: "bestRate", type: "uint256" }] },
  { type: "function", name: "getProtocolInfo", stateMutability: "view", inputs: [{ name: "protocolId", type: "uint256" }], outputs: [{ name: "name", type: "string" }, { name: "protocol", type: "address" }, { name: "active", type: "bool" }] },
] as const
