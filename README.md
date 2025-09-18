# ResourceCalc

ResourceCalc is a lightweight **Python toolkit + CLI** for resource capacity, cost, and timeline calculations, plus a companion **React (Vite + TypeScript) web portal** for interactive CPU / RPS estimation scenarios.

## Features

- Capacity calculation: estimate headcount needed, utilization.
- Cost calculation: compute total and per-period cost with utilization factor.
- Timeline estimation: derive number of periods required for a given scope.
- Simple, dependency-light design.

## Python Library Installation (development)

```bash
pip install -e .[extras]
```

## CLI Usage

```bash
resourcecalc capacity 100 10 5
resourcecalc cost 5 1000 3 --utilization 0.9
resourcecalc timeline 120 10
```

## Library Usage

```python
from resourcecalc.calculators.capacity import CapacityCalculator, CapacityInput

ci = CapacityInput(demand=100, throughput_per_person=10, periods=5)
result = CapacityCalculator().calculate(ci)
print(result.headcount_needed)
```

## Testing (Python)

```bash
pytest -q
```

## Portal (Web UI)

The interactive portal lives in `portal/` and supports scenario-based estimation:

Scenarios:

- Offline A/B (SEVAL)
- Shadow A/B
- Online A/B (delta)
- Inorganic growth (ΔMAU path)

Features:

- Tabbed scenario selector with full keyboard navigation (Arrow/Home/End)
- Collapsible advanced coefficients (fan-out + CPU per RPS)
- Contextual tooltip help for every parameter
- Accessible results table + CPU core distribution bar chart (with ARIA labels)

### Run the Portal (dev)

```bash
cd portal
npm install
npm run dev
```

Then open the local URL printed by Vite (typically <http://localhost:5173/>).

### Build for Production

```bash
cd portal
npm ci
npm run build
```
Artifacts are emitted to `portal/dist/` (suitable for static hosting or Azure Static Web Apps).

### Lint (TypeScript / ESLint)
 
```bash
cd portal
npm run lint
```

## Monorepo Layout

```text
root
├─ src/resourcecalc/        # Python package (CLI + calculators)
├─ tests/                   # Python tests (pytest)
├─ portal/                  # React + Vite frontend
└─ .github/workflows/       # CI workflow (Python + portal build)
```

## Continuous Integration

GitHub Actions workflow runs both Python tests and the portal TypeScript build to ensure end-to-end integrity.

## Version

See `resourcecalc.version.__version__`.

## Release Tagging

Current baseline tag: `v0.1.0` (initial combined library + portal).

## License

MIT
