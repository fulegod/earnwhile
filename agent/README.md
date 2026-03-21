# EarnWhile - AI Yield Optimization Agent

**GenLayer Intelligent Contract for idle capital in limit orders.**

When you place a limit order on a DEX, your capital sits idle until the price is hit. EarnWhile deploys that capital into yield-generating DeFi protocols and automatically withdraws it when the order is about to execute — so your money earns while it waits.

---

## Architecture

```
                          +-----------------------------+
                          |       EarnWhile dApp        |
                          |    (Frontend + Backend)     |
                          +-------------+---------------+
                                        |
                                        | deploy / call
                                        v
                     +------------------+------------------+
                     |     GenLayer Bradbury Testnet       |
                     |                                     |
                     |  +--------------+  +--------------+ |
                     |  | Validator A  |  | Validator B  | |
                     |  | (GPT-4o)    |  | (Claude)     | |
                     |  +------+-------+  +------+-------+ |
                     |         |                 |         |
                     |         v                 v         |
                     |  +------+-----------------+------+  |
                     |  |   YieldAgent Contract         |  |
                     |  |                               |  |
                     |  |  evaluate_strategy()          |  |
                     |  |  monitor_and_rebalance()      |  |
                     |  |  emergency_withdraw()         |  |
                     |  |  get_best_protocol()          |  |
                     |  |  calculate_optimal_allocation()|  |
                     |  +-------------------------------+  |
                     |                                     |
                     +-------------------------------------+
                                        |
                          +-------------+---------------+
                          |    DeFi Protocol Layer      |
                          |                             |
                          |  Aave V3 | BENQI | Compound |
                          |  Trader Joe | Platypus      |
                          +-----------------------------+
```

## How Optimistic Democracy Works for Yield Optimization

GenLayer uses **Optimistic Democracy** — a consensus mechanism where multiple validators, each running a different LLM, independently evaluate the same inputs and must agree on the output.

### Why this matters for yield optimization:

1. **No single AI bias.** GPT-4, Claude, and Llama may each have different tendencies when evaluating risk. Requiring consensus means the strategy is only accepted when multiple independent models agree, filtering out model-specific hallucinations or biases.

2. **Equivalence Principle.** The contract's LLM prompts are designed around quantitative inputs (APY numbers, risk scores, percentage thresholds) and explicit ranking rules. This ensures different models produce equivalent allocations from the same data — the key requirement for Optimistic Democracy to work efficiently.

3. **Escalation on disagreement.** If validators disagree beyond a configured threshold, the decision escalates to a larger quorum. This prevents edge-case errors from slipping through.

4. **Trustless execution.** Users don't need to trust a single server or API. The allocation logic runs on-chain, verified by multiple independent parties.

## Strategy Tiers

| Price Distance | Tier | Behavior |
|---|---|---|
| > 10% | **Aggressive** | Deploy to highest APY, including locked protocols |
| 3% - 10% | **Moderate** | Instant-withdraw protocols only |
| < 3% | **Conservative** | Gradual withdrawal, 20% cash reserve |
| 0% (hit) | **Emergency** | Full withdrawal, execute the swap |

## Protocol Registry

| Protocol | APY (bps) | Risk Score | Lockup | Instant Withdraw |
|---|---|---|---|---|
| Aave V3 | 820 | 95/100 | None | Yes |
| Compound V3 | 710 | 92/100 | None | Yes |
| BENQI | 950 | 88/100 | None | Yes |
| Trader Joe | 1200 | 75/100 | 1 hour | No |
| Platypus | 680 | 90/100 | None | Yes |

## Project Structure

```
agent/
├── contracts/
│   └── yield_agent.py          # Main Intelligent Contract
├── tests/
│   └── test_yield_agent.py     # Tests (mock GenLayer SDK)
├── README.md
└── requirements.txt
```

## Deploy to GenLayer Bradbury Testnet

### Prerequisites

- Python 3.11+
- GenLayer CLI (`pip install genlayer`)
- A funded account on the Bradbury testnet

### Steps

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure the GenLayer CLI for Bradbury testnet
genlayer config set --network bradbury

# 3. Deploy the contract
genlayer contracts deploy contracts/yield_agent.py \
  --account <YOUR_ACCOUNT_ADDRESS>

# 4. Call evaluate_strategy (example)
genlayer contracts call <CONTRACT_ADDRESS> evaluate_strategy \
  --args '["order-1", 850, 1000, 1000000, ""]'

# 5. Run tests locally (no SDK needed)
python -m pytest tests/ -v
```

### Using the GenLayer Studio (GUI)

1. Open [GenLayer Studio](https://studio.genlayer.com)
2. Paste the contents of `contracts/yield_agent.py`
3. Deploy to the simulator or Bradbury testnet
4. Call methods via the interactive UI

## Fee Structure

- **Performance fee:** 10% of yield generated (1000 basis points)
- Fee is only charged on actual yield, never on principal
- Enforced by the contract — no hidden charges

## Key Design Decisions

- **Deterministic fallback:** If an LLM returns malformed output, the contract falls back to a pure-arithmetic allocation. This guarantees the contract never reverts due to an LLM error.
- **Largest-remainder rounding:** Percentage allocations always sum to exactly 100, avoiding rounding drift.
- **Append-only history:** Every decision is logged on-chain for full auditability.
- **Risk-adjusted scoring:** Protocols are ranked by `APY * risk_score / 100`, not raw APY alone.

## License

MIT
