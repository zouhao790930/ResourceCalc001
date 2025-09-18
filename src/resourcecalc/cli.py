from __future__ import annotations

import argparse
from dataclasses import dataclass
from typing import List

from .calculators.capacity import CapacityCalculator, CapacityInput
from .calculators.cost import CostCalculator, CostInput
from .calculators.timeline import TimelineCalculator, TimelineInput
from .version import __version__


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="resourcecalc",
        description="Resource capacity, cost, and timeline calculation toolkit"
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")

    sub = parser.add_subparsers(dest="command", required=True)

    # Capacity
    p_cap = sub.add_parser("capacity", help="Compute capacity utilization and headcount needs")
    p_cap.add_argument("demand", type=float, help="Total demand units (e.g. story points, hours)")
    p_cap.add_argument("throughput", type=float, help="Average throughput per person per period")
    p_cap.add_argument("periods", type=int, help="Number of periods to evaluate")

    # Cost
    p_cost = sub.add_parser("cost", help="Compute cost given rates and utilization")
    p_cost.add_argument("headcount", type=int, help="Number of FTEs")
    p_cost.add_argument("rate", type=float, help="Cost rate per FTE per period")
    p_cost.add_argument("periods", type=int, help="Number of periods")
    p_cost.add_argument("--utilization", type=float, default=0.85, help="Utilization factor (default 0.85)")

    # Timeline
    p_time = sub.add_parser("timeline", help="Estimate timeline given scope and throughput")
    p_time.add_argument("scope", type=float, help="Total scope units (e.g. story points, hours)")
    p_time.add_argument("throughput", type=float, help="Team throughput per period")

    return parser


def main(argv: List[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "capacity":
        ci = CapacityInput(demand=args.demand, throughput_per_person=args.throughput, periods=args.periods)
        result = CapacityCalculator().calculate(ci)
        print(result.to_pretty())
        return 0
    elif args.command == "cost":
        co = CostInput(headcount=args.headcount, rate_per_fte=args.rate, periods=args.periods, utilization=args.utilization)
        result = CostCalculator().calculate(co)
        print(result.to_pretty())
        return 0
    elif args.command == "timeline":
        ti = TimelineInput(scope=args.scope, throughput=args.throughput)
        result = TimelineCalculator().calculate(ti)
        print(result.to_pretty())
        return 0
    else:
        parser.error("Unknown command")
        return 1


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
