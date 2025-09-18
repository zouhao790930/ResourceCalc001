from resourcecalc.calculators.capacity import CapacityCalculator, CapacityInput
from resourcecalc.calculators.cost import CostCalculator, CostInput
from resourcecalc.calculators.timeline import TimelineCalculator, TimelineInput


def test_capacity():
    ci = CapacityInput(demand=100, throughput_per_person=10, periods=5)
    result = CapacityCalculator().calculate(ci)
    assert result.headcount_needed > 0


def test_cost():
    co = CostInput(headcount=5, rate_per_fte=1000, periods=3)
    result = CostCalculator().calculate(co)
    assert result.total_cost == 5 * 1000 * 0.85 * 3


def test_timeline():
    ti = TimelineInput(scope=120, throughput=10)
    result = TimelineCalculator().calculate(ti)
    assert result.periods_needed == 12
