# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json

PROTOCOLS = [
    {"id": "aave-v3", "name": "Aave V3", "apy": 820, "risk": 95, "instant": True},
    {"id": "compound-v3", "name": "Compound V3", "apy": 710, "risk": 92, "instant": True},
    {"id": "benqi", "name": "BENQI", "apy": 950, "risk": 88, "instant": True},
    {"id": "trader-joe", "name": "Trader Joe", "apy": 1200, "risk": 75, "instant": False},
    {"id": "platypus", "name": "Platypus", "apy": 680, "risk": 90, "instant": True},
]


class YieldAgent(gl.Contract):
    strategies: str
    log: str

    def __init__(self):
        self.strategies = "{}"
        self.log = "[]"

    @gl.public.write
    def evaluate_strategy(self, order_id: str, current_price: int, target_price: int, amount: int) -> None:
        if target_price == 0:
            return

        distance = abs(current_price - target_price) / target_price * 100.0

        if distance > 10.0:
            tier = "aggressive"
            eligible = PROTOCOLS
        elif distance > 3.0:
            tier = "moderate"
            eligible = [p for p in PROTOCOLS if p["instant"]]
        elif distance > 0:
            tier = "conservative"
            eligible = [p for p in PROTOCOLS if p["instant"]]
        else:
            strategies = json.loads(self.strategies)
            strategies[order_id] = {"tier": "emergency", "allocations": []}
            self.strategies = json.dumps(strategies)
            return

        proto_list = ", ".join(
            f"{p['name']}(APY={p['apy']}bp, risk={p['risk']}/100, score={round(p['apy']*p['risk']/100,1)})"
            for p in eligible
        )

        tier_rules = {
            "aggressive": "Max yield. Top protocol up to 50%. Min 2 protocols.",
            "moderate": "Balanced. No protocol over 40%. Min 2 protocols.",
            "conservative": "Safety first. No protocol over 35%. Keep 20% cash.",
        }

        prompt = f"""You are a DeFi yield optimizer for EarnWhile protocol.
Order: {order_id}, Amount: {amount}, Price distance: {round(distance,2)}%, Tier: {tier}
Protocols: {proto_list}
Rules: {tier_rules[tier]}
Rank by composite_score = APY * risk / 100. Allocate percentages.
Respond ONLY with JSON, no other text:
{{"allocations": [{{"id": "protocol-id", "name": "Protocol Name", "pct": 50}}], "reasoning": "one sentence"}}"""

        def get_allocation():
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            print(result)
            return result

        llm_response = gl.eq_principle.prompt_comparative(
            get_allocation,
            "The protocol allocation percentages must match"
        )

        try:
            parsed = json.loads(llm_response)
            allocations = parsed.get("allocations", [])
            reasoning = parsed.get("reasoning", "")
        except Exception:
            scored = sorted(eligible, key=lambda p: p["apy"] * p["risk"], reverse=True)
            allocations = [{"id": scored[0]["id"], "name": scored[0]["name"], "pct": 60}]
            if len(scored) > 1:
                allocations.append({"id": scored[1]["id"], "name": scored[1]["name"], "pct": 40})
            reasoning = "Deterministic fallback allocation"

        strategies = json.loads(self.strategies)
        strategies[order_id] = {"tier": tier, "distance": round(distance, 2), "allocations": allocations, "reasoning": reasoning}
        self.strategies = json.dumps(strategies)

        log_entries = json.loads(self.log)
        log_entries.append({"order": order_id, "tier": tier, "action": "evaluate"})
        self.log = json.dumps(log_entries)

    @gl.public.write
    def emergency_withdraw(self, order_id: str) -> None:
        strategies = json.loads(self.strategies)
        if order_id in strategies:
            del strategies[order_id]
            self.strategies = json.dumps(strategies)
            log_entries = json.loads(self.log)
            log_entries.append({"order": order_id, "action": "emergency_withdraw"})
            self.log = json.dumps(log_entries)

    @gl.public.view
    def get_strategy(self, order_id: str) -> str:
        strategies = json.loads(self.strategies)
        return json.dumps(strategies.get(order_id))

    @gl.public.view
    def get_best_protocol(self) -> str:
        best = max(PROTOCOLS, key=lambda p: p["apy"] * p["risk"] / 100)
        return json.dumps({"id": best["id"], "name": best["name"], "apy": best["apy"], "risk": best["risk"]})

    @gl.public.view
    def get_log(self) -> str:
        return self.log

    @gl.public.view
    def get_protocols(self) -> str:
        return json.dumps(PROTOCOLS)
