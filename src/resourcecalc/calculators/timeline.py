from __future__ import annotations
from dataclasses import dataclass
import math

__all__ = ["TimelineInput", "TimelineResult", "TimelineCalculator"]

@dataclass(slots=True)
class TimelineInput:
    scope: float
    throughput: float  # per period

    def validate(self) -> None:
        if self.scope <= 0:
            raise ValueError("scope must be > 0")
        if self.throughput <= 0:
            raise ValueError("throughput must be > 0")

@dataclass(slots=True)
class TimelineResult:
    periods_needed: int
    avg_throughput: float

    def to_pretty(self) -> str:
        return (
            f"Periods Needed: {self.periods_needed}\n"
            f"Average Throughput: {self.avg_throughput:.2f}"
        )

class TimelineCalculator:
    def calculate(self, input: TimelineInput) -> TimelineResult:
        input.validate()
        periods_needed = int(math.ceil(input.scope / input.throughput))
        return TimelineResult(periods_needed=periods_needed, avg_throughput=input.throughput)
