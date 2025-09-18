from __future__ import annotations
from dataclasses import dataclass

__all__ = ["CostInput", "CostResult", "CostCalculator"]

@dataclass(slots=True)
class CostInput:
    headcount: int
    rate_per_fte: float
    periods: int
    utilization: float = 0.85

    def validate(self) -> None:
        if self.headcount <= 0:
            raise ValueError("headcount must be > 0")
        if self.rate_per_fte <= 0:
            raise ValueError("rate_per_fte must be > 0")
        if self.periods <= 0:
            raise ValueError("periods must be > 0")
        if not (0 < self.utilization <= 1):
            raise ValueError("utilization must be in (0,1]")

@dataclass(slots=True)
class CostResult:
    total_cost: float
    cost_per_period: float
    effective_utilization: float

    def to_pretty(self) -> str:
        return (
            f"Total Cost: {self.total_cost:.2f}\n"
            f"Cost / Period: {self.cost_per_period:.2f}\n"
            f"Effective Utilization: {self.effective_utilization:.2%}"
        )

class CostCalculator:
    def calculate(self, input: CostInput) -> CostResult:
        input.validate()
        cost_per_period = input.headcount * input.rate_per_fte * input.utilization
        total_cost = cost_per_period * input.periods
        return CostResult(total_cost=total_cost, cost_per_period=cost_per_period, effective_utilization=input.utilization)
