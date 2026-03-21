# =============================================================================
# Tests for EarnWhile YieldAgent Intelligent Contract
# =============================================================================
#
# These tests exercise the deterministic logic of the contract WITHOUT
# requiring the GenLayer SDK or an LLM. They mock gl.exec_prompt to return
# predictable JSON so we can verify allocation maths, tier transitions,
# emergency withdrawals, and the optimal-allocation algorithm.
#
# Run:  python -m pytest tests/test_yield_agent.py -v
# =============================================================================

import json
import sys
import types
from unittest.mock import MagicMock, patch

# ---------------------------------------------------------------------------
# Mock the genlayer SDK so tests can run without installing it
# ---------------------------------------------------------------------------
genlayer_mock = types.ModuleType("genlayer")
genlayer_py = types.ModuleType("genlayer.py")
genlayer_calldata = types.ModuleType("genlayer.py.calldata")
genlayer_types = types.ModuleType("genlayer.py.types")
genlayer_std = types.ModuleType("genlayer.std")

# Provide stubs for SDK symbols used by the contract
genlayer_calldata.calldata = lambda x: x
genlayer_types.u256 = int

# gl.public.write and gl.public.view are decorators — make them no-ops
_public = types.SimpleNamespace()
_public.write = lambda fn: fn
_public.view = lambda fn: fn
genlayer_std.public = _public
genlayer_std.exec_prompt = MagicMock(return_value="{}")

sys.modules["genlayer"] = genlayer_mock
sys.modules["genlayer.py"] = genlayer_py
sys.modules["genlayer.py.calldata"] = genlayer_calldata
sys.modules["genlayer.py.types"] = genlayer_types
sys.modules["genlayer.std"] = genlayer_std

# Now we can import the contract
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent / "contracts"))
from yield_agent import YieldAgent, PROTOCOLS, TIER_AGGRESSIVE, TIER_MODERATE


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
SAMPLE_PROTOCOLS_JSON = json.dumps(PROTOCOLS)


def _make_agent() -> YieldAgent:
    """Create a fresh agent instance."""
    return YieldAgent()


def _mock_llm_response(allocations: list, reasoning: str = "test") -> str:
    """Build a JSON string mimicking what the LLM would return."""
    return json.dumps({"allocations": allocations, "reasoning": reasoning})


# ===========================================================================
# 1. evaluate_strategy
# ===========================================================================
class TestEvaluateStrategy:

    def test_aggressive_tier_when_far_from_target(self):
        """Price 15% away => aggressive tier."""
        agent = _make_agent()
        # Mock LLM to return a simple allocation
        mock_response = _mock_llm_response([
            {"protocol_id": "trader-joe", "protocol_name": "Trader Joe", "pct": 50},
            {"protocol_id": "benqi", "protocol_name": "BENQI", "pct": 30},
            {"protocol_id": "aave-v3", "protocol_name": "Aave V3", "pct": 20},
        ])
        genlayer_std.exec_prompt = MagicMock(return_value=mock_response)

        result = json.loads(agent.evaluate_strategy(
            "order-1", 850, 1000, 10000, SAMPLE_PROTOCOLS_JSON
        ))

        assert result["tier"] == "aggressive"
        assert result["price_distance_pct"] == 15.0
        assert len(result["allocations"]) == 3
        assert sum(a["pct"] for a in result["allocations"]) == 100

    def test_moderate_tier(self):
        """Price 5% away => moderate tier."""
        agent = _make_agent()
        mock_response = _mock_llm_response([
            {"protocol_id": "benqi", "protocol_name": "BENQI", "pct": 40},
            {"protocol_id": "aave-v3", "protocol_name": "Aave V3", "pct": 35},
            {"protocol_id": "compound-v3", "protocol_name": "Compound V3", "pct": 25},
        ])
        genlayer_std.exec_prompt = MagicMock(return_value=mock_response)

        result = json.loads(agent.evaluate_strategy(
            "order-2", 950, 1000, 10000, SAMPLE_PROTOCOLS_JSON
        ))

        assert result["tier"] == "moderate"
        assert 3.0 < result["price_distance_pct"] <= 10.0

    def test_conservative_tier(self):
        """Price 2% away => conservative tier."""
        agent = _make_agent()
        mock_response = _mock_llm_response([
            {"protocol_id": "aave-v3", "protocol_name": "Aave V3", "pct": 35},
            {"protocol_id": "compound-v3", "protocol_name": "Compound V3", "pct": 25},
            {"protocol_id": "benqi", "protocol_name": "BENQI", "pct": 20},
        ])
        genlayer_std.exec_prompt = MagicMock(return_value=mock_response)

        result = json.loads(agent.evaluate_strategy(
            "order-3", 980, 1000, 10000, SAMPLE_PROTOCOLS_JSON
        ))

        assert result["tier"] == "conservative"
        assert result["price_distance_pct"] == 2.0

    def test_emergency_tier_at_target(self):
        """Price == target => emergency, no allocations."""
        agent = _make_agent()

        result = json.loads(agent.evaluate_strategy(
            "order-4", 1000, 1000, 10000, SAMPLE_PROTOCOLS_JSON
        ))

        assert result["tier"] == "emergency"
        assert result["allocations"] == []

    def test_zero_target_price_returns_error(self):
        agent = _make_agent()
        result = json.loads(agent.evaluate_strategy(
            "order-err", 100, 0, 10000, SAMPLE_PROTOCOLS_JSON
        ))
        assert "error" in result

    def test_strategy_stored_in_active_strategies(self):
        agent = _make_agent()
        mock_response = _mock_llm_response([
            {"protocol_id": "aave-v3", "protocol_name": "Aave V3", "pct": 100},
        ])
        genlayer_std.exec_prompt = MagicMock(return_value=mock_response)

        agent.evaluate_strategy("order-store", 800, 1000, 5000, SAMPLE_PROTOCOLS_JSON)

        assert "order-store" in agent.active_strategies
        assert agent.active_strategies["order-store"]["tier"] == "aggressive"

    def test_deterministic_fallback_on_bad_llm_response(self):
        """If LLM returns garbage, deterministic allocation kicks in."""
        agent = _make_agent()
        genlayer_std.exec_prompt = MagicMock(return_value="NOT VALID JSON!!!")

        result = json.loads(agent.evaluate_strategy(
            "order-fallback", 800, 1000, 10000, SAMPLE_PROTOCOLS_JSON
        ))

        assert result["tier"] == "aggressive"
        assert len(result["allocations"]) > 0
        # Deterministic aggressive: top protocol gets 50%
        assert result["allocations"][0]["pct"] == 50


# ===========================================================================
# 2. monitor_and_rebalance
# ===========================================================================
class TestMonitorAndRebalance:

    def test_new_order_triggers_deposit(self):
        agent = _make_agent()
        orders = json.dumps([
            {"order_id": "o1", "target_price": 1000, "amount": 5000}
        ])
        market = json.dumps({"AVAX/USDC": 800})

        actions = json.loads(agent.monitor_and_rebalance(orders, market))

        assert len(actions) == 1
        assert actions[0]["action"] == "deposit"
        assert actions[0]["new_tier"] == "aggressive"

    def test_no_action_when_tier_unchanged(self):
        agent = _make_agent()
        agent.active_strategies["o2"] = {"tier": "aggressive", "positions": [], "timestamp": ""}
        orders = json.dumps([
            {"order_id": "o2", "target_price": 1000, "amount": 5000}
        ])
        market = json.dumps({"AVAX/USDC": 800})  # 20% away => aggressive

        actions = json.loads(agent.monitor_and_rebalance(orders, market))
        assert len(actions) == 0

    def test_tier_downgrade_triggers_withdraw(self):
        agent = _make_agent()
        agent.active_strategies["o3"] = {"tier": "aggressive", "positions": [], "timestamp": ""}
        orders = json.dumps([
            {"order_id": "o3", "target_price": 1000, "amount": 5000}
        ])
        market = json.dumps({"AVAX/USDC": 950})  # 5% away => moderate

        actions = json.loads(agent.monitor_and_rebalance(orders, market))

        assert len(actions) == 1
        assert actions[0]["action"] == "withdraw"
        assert actions[0]["new_tier"] == "moderate"

    def test_emergency_when_price_hits_target(self):
        agent = _make_agent()
        agent.active_strategies["o4"] = {"tier": "moderate", "positions": [], "timestamp": ""}
        orders = json.dumps([
            {"order_id": "o4", "target_price": 1000, "amount": 5000}
        ])
        market = json.dumps({"AVAX/USDC": 1000})

        actions = json.loads(agent.monitor_and_rebalance(orders, market))

        assert len(actions) == 1
        assert actions[0]["action"] == "emergency_withdraw"


# ===========================================================================
# 3. emergency_withdraw
# ===========================================================================
class TestEmergencyWithdraw:

    def test_withdraw_from_active_positions(self):
        agent = _make_agent()
        agent.active_strategies["o5"] = {
            "tier": "aggressive",
            "positions": [
                {"protocol_id": "aave-v3", "pct": 60, "amount": 6000},
                {"protocol_id": "trader-joe", "pct": 40, "amount": 4000},
            ],
            "timestamp": "",
        }

        result = json.loads(agent.emergency_withdraw("o5"))

        assert result["status"] == "withdrawing"
        assert result["total_withdrawn"] == 10000
        assert len(result["withdrawals"]) == 2

        # Aave is instant, Trader Joe has lockup
        aave_w = next(w for w in result["withdrawals"] if w["protocol_id"] == "aave-v3")
        tj_w = next(w for w in result["withdrawals"] if w["protocol_id"] == "trader-joe")
        assert aave_w["method"] == "instant"
        assert tj_w["method"] == "queued"
        assert tj_w["estimated_seconds"] == 3600

    def test_withdraw_nonexistent_order(self):
        agent = _make_agent()
        result = json.loads(agent.emergency_withdraw("no-such-order"))
        assert result["status"] == "no_active_strategy"

    def test_withdraw_clears_active_strategy(self):
        agent = _make_agent()
        agent.active_strategies["o6"] = {
            "tier": "moderate",
            "positions": [{"protocol_id": "benqi", "pct": 100, "amount": 1000}],
            "timestamp": "",
        }
        agent.emergency_withdraw("o6")
        assert "o6" not in agent.active_strategies


# ===========================================================================
# 4. get_best_protocol
# ===========================================================================
class TestGetBestProtocol:

    def test_instant_withdraw_only(self):
        agent = _make_agent()
        result = json.loads(agent.get_best_protocol("AVAX", 0))

        # With lockup=0, Trader Joe (lockup=3600) is excluded.
        # Remaining: Aave (820*95=779), Compound (710*92=653.2),
        # BENQI (950*88=836), Platypus (680*90=612)
        # Best = BENQI at 836
        assert result["protocol_id"] == "benqi"

    def test_with_lockup_allowed(self):
        agent = _make_agent()
        result = json.loads(agent.get_best_protocol("AVAX", 7200))

        # Now Trader Joe is eligible: 1200*75 = 900 > BENQI's 836
        assert result["protocol_id"] == "trader-joe"

    def test_no_eligible_protocols(self):
        agent = _make_agent()
        # Set all protocols to have high lockup
        agent.protocol_registry = [
            {**p, "min_lockup": 999999} for p in PROTOCOLS
        ]
        result = json.loads(agent.get_best_protocol("AVAX", 0))
        assert result is None


# ===========================================================================
# 5. calculate_optimal_allocation
# ===========================================================================
class TestCalculateOptimalAllocation:

    def test_max_risk_concentrates_in_top(self):
        agent = _make_agent()
        result = json.loads(agent.calculate_optimal_allocation(
            100000, SAMPLE_PROTOCOLS_JSON, 100
        ))

        allocs = result["allocations"]
        # At risk_tolerance=100, weights are proportional to composite score.
        # Top protocol should get the largest share.
        top = allocs[0]
        assert top["pct"] >= allocs[-1]["pct"]

    def test_zero_risk_spreads_evenly(self):
        agent = _make_agent()
        result = json.loads(agent.calculate_optimal_allocation(
            100000, SAMPLE_PROTOCOLS_JSON, 0
        ))

        allocs = result["allocations"]
        # At risk_tolerance=0, all weights equal => 20% each (5 protocols)
        for a in allocs:
            assert a["pct"] == 20

    def test_percentages_sum_to_100(self):
        agent = _make_agent()
        for rt in [0, 25, 50, 75, 100]:
            result = json.loads(agent.calculate_optimal_allocation(
                100000, SAMPLE_PROTOCOLS_JSON, rt
            ))
            total_pct = sum(a["pct"] for a in result["allocations"])
            assert total_pct == 100, f"Sum is {total_pct} at risk_tolerance={rt}"

    def test_empty_protocols(self):
        agent = _make_agent()
        result = json.loads(agent.calculate_optimal_allocation(10000, "[]", 50))
        assert result["allocations"] == []
        assert result["expected_blended_apy_bps"] == 0

    def test_amounts_match_percentages(self):
        agent = _make_agent()
        amount = 100000
        result = json.loads(agent.calculate_optimal_allocation(
            amount, SAMPLE_PROTOCOLS_JSON, 50
        ))
        for a in result["allocations"]:
            expected_amount = int(amount * a["pct"] / 100)
            assert a["amount"] == expected_amount


# ===========================================================================
# 6. Read-only accessors
# ===========================================================================
class TestAccessors:

    def test_get_active_strategy_exists(self):
        agent = _make_agent()
        agent.active_strategies["x"] = {"tier": "moderate", "positions": [], "timestamp": ""}
        result = json.loads(agent.get_active_strategy("x"))
        assert result["tier"] == "moderate"

    def test_get_active_strategy_missing(self):
        agent = _make_agent()
        result = json.loads(agent.get_active_strategy("missing"))
        assert result is None

    def test_performance_history_recorded(self):
        agent = _make_agent()
        mock_response = _mock_llm_response([
            {"protocol_id": "aave-v3", "protocol_name": "Aave V3", "pct": 100},
        ])
        genlayer_std.exec_prompt = MagicMock(return_value=mock_response)

        agent.evaluate_strategy("hist-test", 800, 1000, 5000, SAMPLE_PROTOCOLS_JSON)

        history = json.loads(agent.get_performance_history())
        assert len(history) >= 1
        assert history[0]["order_id"] == "hist-test"

    def test_get_protocol_registry(self):
        agent = _make_agent()
        registry = json.loads(agent.get_protocol_registry())
        assert len(registry) == 5
