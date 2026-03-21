# EarnWhile

### Your capital yields while it waits.

**The problem:** On Uniswap alone, 40-50% of all liquidity sits "out of range" earning zero fees -- billions of dollars under a digital mattress. Every limit order on every DEX locks capital that earns nothing until the price is hit.

**The solution:** EarnWhile is a yield layer that automatically deploys idle limit-order capital into DeFi protocols, then withdraws and executes the trade when the target price arrives. An AI agent powered by GenLayer's Optimistic Democracy chooses the optimal strategy -- verified by multiple independent LLMs, not a single server.

---

## How It Works

```
1. Create Limit Order    "Buy ETH at $2,000 with 5,000 USDC"
2. AI Deploys Capital    Agent puts 5K USDC into Aave at 8.2% APY
3. Earn While Waiting    $1.12/day in yield while price hasn't hit
4. Price Hits            Withdraw from protocol + execute the swap
5. Result                User gets ETH + extra yield earned
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND  (React + Vite + Tailwind)           │
│            wagmi · RainbowKit · Recharts · Avalanche Fuji        │
└──────────────────────────┬───────────────────────────────────────┘
                           │  tx calls
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
  │ EarnWhile   │  │  OrderBook  │  │ YieldRouter  │
  │ Vault.sol   │  │  .sol       │  │ .sol         │
  │ (deposits)  │  │ (orders)    │  │ (routing)    │
  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘
         └────────────────┼────────────────┘
                          │  strategy calls
                          ▼
          ┌──────────────────────────────────┐
          │     GENLAYER AI YIELD AGENT      │
          │     Bradbury Testnet             │
          │                                  │
          │  5 Validators (GPT-4o, Claude,   │
          │  Llama, ...) reach consensus     │
          │  via Optimistic Democracy        │
          │                                  │
          │  evaluate_strategy()             │
          │  monitor_and_rebalance()         │
          │  emergency_withdraw()            │
          └──────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    ┌─────────┐    ┌──────────┐    ┌──────────┐
    │ Aave V3 │    │  BENQI   │    │ Compound │
    │ 8.2% APY│    │ 9.5% APY │    │ 7.1% APY │
    └─────────┘    └──────────┘    └──────────┘
```

**Flow:** User creates order --> OrderBook locks funds --> YieldRouter deploys to the best protocol --> AI Agent continuously optimizes allocation via Optimistic Democracy --> When target price is hit, emergency withdraw and execute the swap.

---

## Optimistic Democracy Deep Dive

We don't use GenLayer as a toy wrapper around a single LLM call. The AI Yield Agent is an **Intelligent Contract** where yield-allocation decisions are verified through multi-validator consensus:

1. **Multiple LLMs, independent evaluation.** Each validator (GPT-4o, Claude, Llama, etc.) independently analyzes protocol APYs, risk scores, and price distance to produce an allocation. No single model's bias or hallucination can dictate where funds go.

2. **Equivalence by design.** Prompts use quantitative inputs (APY in basis points, risk scores 0-100, explicit ranking rules) so different models produce equivalent allocations from the same data -- the requirement for Optimistic Democracy to converge efficiently.

3. **Escalation on disagreement.** If validators disagree beyond threshold, the decision escalates to a larger quorum. Edge-case errors don't slip through.

4. **Strategy tiers based on price distance:**

| Price Distance | Tier | Behavior |
|---|---|---|
| > 10% | Aggressive | Deploy to highest APY, including locked protocols |
| 3% - 10% | Moderate | Instant-withdraw protocols only |
| < 3% | Conservative | Gradual withdrawal, 20% cash reserve |
| 0% (hit) | Emergency | Full withdrawal, execute the swap |

5. **Deterministic fallback.** If an LLM returns malformed output, the contract falls back to pure-arithmetic allocation. The contract never reverts due to an LLM error.

---

## Why LATAM?

In Latin America, inflation rates of 50-200%+ make idle capital lose real purchasing power every day. A limit order that sits for a week isn't just opportunity cost -- it's a measurable loss in what that capital can buy.

EarnWhile is especially relevant for LATAM markets:
- **Every minute of idle capital = real purchasing power lost** to inflation
- DeFi adoption in LATAM is driven by necessity, not speculation
- Even small yields (5-10% APY) compound meaningfully against local currency devaluation
- Avalanche's low fees make micro-yield strategies viable for smaller portfolios

---

## Revenue Model

EarnWhile takes **10% of yield generated** as a protocol fee.

Without EarnWhile, users earn **$0** on limit-order capital. With EarnWhile, users earn **90% of yield** they wouldn't have had. Win-win -- we only make money when users make money.

---

## Tech Stack

| Layer | Stack |
|---|---|
| Smart Contracts | Solidity + Hardhat + OpenZeppelin on **Avalanche Fuji** testnet |
| AI Agent | Python + GenLayer SDK on **Bradbury** testnet |
| Frontend | React + Vite + Tailwind + wagmi + RainbowKit + Recharts |

## Deployed Contracts (Avalanche Fuji -- Chain ID 43113)

| Contract | Address |
|---|---|
| EarnWhileVault | [`0xaa7E2BAE9b702612985F19eEcc8765a28c74E453`](https://testnet.snowtrace.io/address/0xaa7E2BAE9b702612985F19eEcc8765a28c74E453) |
| OrderBook | [`0xF267c381485C63297E5bB85109FfD2f1C97B8F92`](https://testnet.snowtrace.io/address/0xF267c381485C63297E5bB85109FfD2f1C97B8F92) |
| YieldRouter | [`0x216d93A00F91f2062df30D492d23E0D8C1f01352`](https://testnet.snowtrace.io/address/0x216d93A00F91f2062df30D492d23E0D8C1f01352) |
| MockUSDC | [`0x2D0a68a5FF3B00828cBE62C092b8250F4b20CD9a`](https://testnet.snowtrace.io/address/0x2D0a68a5FF3B00828cBE62C092b8250F4b20CD9a) |
| MockWETH | [`0x1eAB27e7BCbF5c3a3d534Fc2506cC53145B8d23e`](https://testnet.snowtrace.io/address/0x1eAB27e7BCbF5c3a3d534Fc2506cC53145B8d23e) |
| MockAave (5% APY) | [`0x5E2F0B6D5F9a13D45bbfe1CB5EfF4AA9dcc154e4`](https://testnet.snowtrace.io/address/0x5E2F0B6D5F9a13D45bbfe1CB5EfF4AA9dcc154e4) |
| MockCompound (3% APY) | [`0x3bace74c7363EFf07090b86Ba26673424dd69766`](https://testnet.snowtrace.io/address/0x3bace74c7363EFf07090b86Ba26673424dd69766) |

---

## Live Demo

**Frontend:** https://frontend-puce-rho-23.vercel.app

**GitHub:** https://github.com/fulegod/earnwhile

---

## Quick Start

### Smart Contracts
```bash
cd contracts
npm install
npx hardhat test          # 26/26 tests passing
npx hardhat run scripts/deploy.ts --network fuji
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### AI Agent
```bash
cd agent
pip install -r requirements.txt
python -m pytest tests/ -v
# Deploy to GenLayer Bradbury testnet via studio.genlayer.com
```

## Project Structure

```
sas/
├── contracts/     # Solidity smart contracts (Hardhat)
├── frontend/      # React + Vite dashboard
├── agent/         # GenLayer AI Intelligent Contract
└── README.md
```

---

## Tracks

| Track | Prize | What We Built |
|---|---|---|
| **Avalanche** | $5,000 | Full DEX with limit orders + Vault + YieldRouter on Avalanche Fuji L1 |
| **GenLayer** | $1,500 | AI Yield Agent as Intelligent Contract with deep Optimistic Democracy usage |
| **PL_Genesis** | $2,000 | Growth Track -- real problem, LATAM relevance, viable revenue model |

---

## License

MIT

---

Built for [Aleph Hackathon March 2026](https://dorahacks.io) | Solo + Claude Code
