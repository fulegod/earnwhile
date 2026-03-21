# EarnWhile

> **Your capital yields while it waits.**

A yield layer for idle capital in limit orders. When you place a limit order on a DEX, your tokens sit locked doing nothing. EarnWhile automatically deploys them to yield-generating protocols. When your order executes, it withdraws and completes the trade. **Zero idle capital.**

## The Problem

On Uniswap alone, 40-50% of all liquidity is "out of range" earning zero fees — billions of dollars sitting under a digital mattress. Every limit order on every DEX has the same problem: locked capital earning nothing.

## How It Works

```
1. Connect Wallet → User connects their wallet
2. Create Limit Order → "Buy ETH at $2,000 with 5,000 USDC"
3. AI Deposits → Agent puts 5K USDC in Aave at 8.2%
4. Wait + Yield → $1.12/day while price hasn't hit
5. Order Executed → Price arrives → withdraw → execute swap
6. Profit → ETH purchased + extra yield earned
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                     │
│  Dashboard │ Trade │ My Orders │ AI Agent Panel              │
│                   wagmi + RainbowKit                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  EarnWhile   │ │  OrderBook   │ │  YieldRouter │
│  Vault.sol   │ │  .sol        │ │  .sol        │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       └────────────────┼────────────────┘
                        ▼
          ┌───────────────────────────┐
          │     AI YIELD AGENT        │
          │   (GenLayer / Python)     │
          │  Optimistic Democracy     │
          └───────────────────────────┘
```

## Tech Stack

| Layer | Stack |
|---|---|
| Smart Contracts | Solidity + Hardhat + OpenZeppelin → Avalanche Fuji testnet |
| AI Agent | Python + GenLayer SDK → Bradbury testnet |
| Frontend | React + Vite + Tailwind + wagmi + RainbowKit + Recharts |

## Revenue Model

EarnWhile takes **10% of yield generated** as a protocol fee. Without EarnWhile, users earn **$0**. With EarnWhile, users earn **90% of yield** — a win-win.

## Project Structure

```
sas/
├── contracts/     # Solidity smart contracts (Hardhat)
├── frontend/      # React + Vite dashboard
├── agent/         # GenLayer AI Intelligent Contract
└── README.md
```

## Quick Start

### Smart Contracts
```bash
cd contracts
npm install
npx hardhat test
npx hardhat run scripts/deploy.ts --network fuji
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### AI Agent
```bash
cd agent
# Deploy to GenLayer Bradbury testnet via portal.genlayer.foundation
```

## Deployed Contracts (Avalanche Fuji - Chain ID 43113)

| Contract | Address |
|---|---|
| EarnWhileVault | [`0xaa7E2BAE9b702612985F19eEcc8765a28c74E453`](https://testnet.snowtrace.io/address/0xaa7E2BAE9b702612985F19eEcc8765a28c74E453) |
| OrderBook | [`0xF267c381485C63297E5bB85109FfD2f1C97B8F92`](https://testnet.snowtrace.io/address/0xF267c381485C63297E5bB85109FfD2f1C97B8F92) |
| YieldRouter | [`0x216d93A00F91f2062df30D492d23E0D8C1f01352`](https://testnet.snowtrace.io/address/0x216d93A00F91f2062df30D492d23E0D8C1f01352) |
| MockUSDC | [`0x2D0a68a5FF3B00828cBE62C092b8250F4b20CD9a`](https://testnet.snowtrace.io/address/0x2D0a68a5FF3B00828cBE62C092b8250F4b20CD9a) |
| MockWETH | [`0x1eAB27e7BCbF5c3a3d534Fc2506cC53145B8d23e`](https://testnet.snowtrace.io/address/0x1eAB27e7BCbF5c3a3d534Fc2506cC53145B8d23e) |
| MockAave (5% APY) | [`0x5E2F0B6D5F9a13D45bbfe1CB5EfF4AA9dcc154e4`](https://testnet.snowtrace.io/address/0x5E2F0B6D5F9a13D45bbfe1CB5EfF4AA9dcc154e4) |
| MockCompound (3% APY) | [`0x3bace74c7363EFf07090b86Ba26673424dd69766`](https://testnet.snowtrace.io/address/0x3bace74c7363EFf07090b86Ba26673424dd69766) |

## Tracks

- **Avalanche** — DEX with limit orders + Vault + AI Agent on Avalanche L1
- **GenLayer** — AI Agent as Intelligent Contract with Optimistic Democracy
- **PL_Genesis** — Growth Track submission

## License

MIT

---

Built for [Aleph Hackathon March 2026](https://dorahacks.io) | Solo + Claude Code
