from __future__ import annotations
from dataclasses import dataclass

__all__ = ["CapacityInput", "CapacityResult", "CapacityCalculator"]

@dataclass(slots=True)
class CapacityInput:
    demand: float
    throughput_per_person: float
    periods: int

    def validate(self) -> None:
        if self.demand <= 0:
            raise ValueError("demand must be > 0")
        if self.throughput_per_person <= 0:
            raise ValueError("throughput_per_person must be > 0")
        if self.periods <= 0:
            raise ValueError("periods must be > 0")

@dataclass(slots=True)
class CapacityResult:
    headcount_needed: float
    total_throughput: float
    utilization: float

    def to_pretty(self) -> str:
        return (
            f"Headcount Needed: {self.headcount_needed:.2f}\n"
            f"Total Throughput: {self.total_throughput:.2f}\n"
            f"Utilization: {self.utilization:.2%}"
        )

class CapacityCalculator:
    def calculate(self, input: CapacityInput) -> CapacityResult:
        input.validate()
        total_throughput = input.throughput_per_person * input.periods
        headcount_needed = input.demand / total_throughput
        utilization = min(1.0, (input.demand / (headcount_needed * total_throughput)) if headcount_needed else 0)
        return CapacityResult(headcount_needed=headcount_needed, total_throughput=total_throughput, utilization=utilization)
