# ResourceCalc Portal

An interactive **React (Vite + TypeScript) web portal** for CPU / RPS estimation scenarios in Copilot capacity planning.

## Features

- **Interactive scenario-based CPU estimation** for Copilot workloads
- **Real-time calculations** with parameter validation
- **Professional UI** with accessibility features
- **Visual results** with charts and data tables
- **Shareable package** for easy distribution

## Quick Start

The portal supports scenario-based estimation:

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

### Run Locally

```bash
cd portal
npm install
npm run dev
```

Then open <http://localhost:5173/ResourceCalc001/>

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

## Project Structure

```text
root
├─ portal/                  # React + Vite frontend (main application)
├─ doc/                     # Design documentation
├─ .github/workflows/       # CI workflow for portal build & deployment
├─ SHARING.md              # Distribution guide
└─ share.bat/.sh           # Quick build scripts
```

## Deployment

GitHub Actions workflow automatically builds and deploys the portal to GitHub Pages on every push to main.

## Sharing

See `SHARING.md` for multiple ways to share the portal with others, including:

- Online demo via GitHub Pages
- Downloadable ZIP package
- Development setup

## Version

Portal v0.1.0

## License

MIT
