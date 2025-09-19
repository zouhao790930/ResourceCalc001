# ResourceCalc Portal

🚀 **Live Application**: https://zouhao790930.github.io/ResourceCalc001/

An interactive **React (Vite + TypeScript) web portal** for CPU resource estimation in Microsoft Copilot capacity planning. Built with real performance coefficients from production monitoring data.

## 🎯 Features

### ✅ Production-Ready Capabilities
- **🔢 Four Scenario Types**: Offline A/B, Shadow A/B, Online A/B Delta, Inorganic Growth
- **🔄 Dual Input Modes**: Detailed parameter breakdown OR direct QPS input per scenario
- **📊 Real Performance Data**: Coefficients extracted from actual BizChat monitoring dashboards
- **💡 Expandable Explanations**: Step-by-step calculation breakdowns with formulas
- **📱 Responsive Design**: Professional UI with full mobile support
- **♿ Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **⚡ Real-time Calculations**: Instant updates with graceful validation

### 🧮 Calculation Engine
- **Service Chain**: XAP → LSS → CSO → Store fanout propagation
- **Real Coefficients**: Production monitoring data from BizChat systems
- **Transparent Formulas**: Expandable explanations for all calculations
- **Graceful Validation**: No crashes on invalid input, defaults to safe values

## 🚀 Quick Start

### 🌐 Use Online (Recommended)
Visit the live application: **https://zouhao790930.github.io/ResourceCalc001/**

### 💻 Run Locally

```bash
cd portal
npm install
npm run dev
```

Then open http://localhost:5173/ResourceCalc001/

### 🏗️ Build for Production

```bash
cd portal
npm ci
npm run build
```

Artifacts are emitted to `portal/dist/` (suitable for static hosting).

## 📖 Usage Guide

### 🎭 Scenario Types

1. **Offline A/B (SEVAL)**
   - Input: Monthly queries, workdays, active hours
   - Use case: Batch evaluation workload estimation

2. **Shadow A/B** 
   - Input: Live baseline QPS, fork percentage, fork count
   - Use case: Traffic duplication impact analysis

3. **Online A/B Delta**
   - Input: Live baseline QPS, treatment share, delta factor
   - Use case: Incremental experimental load estimation

4. **Inorganic Growth**
   - Input: ΔMAU, DAU/MAU ratio, QPD, realization factor, PCF
   - Use case: User growth-driven capacity planning

### 🔧 Input Modes

Each scenario supports two input approaches:

**📋 Detailed Parameters**: Enter business metrics (queries/month, user growth, etc.)
**⚡ Direct QPS**: Skip complexity and enter QPS directly

Toggle between modes using the checkbox in each scenario tab.

### 📊 Understanding Results

- **Effective QPS**: Final query load for the scenario
- **RPS Breakdown**: Request distribution across services (XAP→LSS→CSO→Store)
- **CPU Cores**: Resource requirements per service and total
- **Calculation Explanations**: Click 📊 and 🔧 sections for step-by-step breakdowns

## 🏗️ Architecture

### 📁 Project Structure
```
portal/
├── src/
│   ├── calc/           # Calculation engine
│   ├── config/         # Performance coefficients
│   ├── ui/             # React components  
│   └── styles.css      # Responsive styling
├── public/             # Static assets
└── dist/               # Production build
```

### 🔧 Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS3 with CSS Variables
- **Deployment**: GitHub Pages + GitHub Actions CI/CD
- **Performance**: Sub-10ms calculations, < 3s page load

### 📊 Real Performance Coefficients
Performance data sourced from actual BizChat monitoring:
- **XAP→LSS Fanout**: 2,500 requests/request
- **LSS→CSO Fanout**: 4.5 requests/request  
- **CSO→Store Fanout**: 6.5 requests/request
- **CPU per Request**: Real cores/request from production systems

## 🧪 Development

### 🔍 Lint & Type Check
```bash
npm run lint    # ESLint + TypeScript checking
npm run type-check  # TypeScript validation
```

### 🏗️ Build & Deploy
```bash
npm run build   # Production build
npm run preview # Local preview of production build
```

### 📈 Performance
- Client-side calculations: < 10ms
- Bundle size: Optimized with Vite
- Mobile performance: Fully responsive design

## 📚 Documentation

- **📋 Requirements**: `doc/REQUIREMENTS.md` - Formal specification
- **🏗️ Design**: `doc/DESIGN.md` - Architecture and implementation details
- **📝 Changelog**: `CHANGELOG.md` - Version history and updates

## 🎯 Use Cases

### 👥 Target Users
- **Capacity Planners**: Resource allocation and scaling decisions
- **Software Engineers**: Impact analysis and sizing estimates  
- **Product Analysts**: Feature impact assessment
- **Strategic Planners**: Long-term capacity planning

### 💼 Common Workflows
1. **New Feature Impact**: Use Online A/B Delta to estimate incremental load
2. **Scaling Planning**: Use Inorganic Growth for user expansion scenarios
3. **Experiment Design**: Use Shadow A/B for safe traffic duplication analysis
4. **Batch Processing**: Use Offline A/B for evaluation workload planning

## 🚀 Deployment

The application is automatically deployed to GitHub Pages via GitHub Actions on every push to main branch.

**Live URL**: https://zouhao790930.github.io/ResourceCalc001/

### 📦 Deployment Pipeline
1. Code pushed to `main` branch
2. GitHub Actions runs build process
3. Static files deployed to GitHub Pages
4. Application immediately available at live URL

## 🔮 Future Enhancements

- **📊 Scenario Comparison**: Side-by-side analysis
- **💾 Export Functionality**: CSV/JSON download
- **🔄 Auto-Coefficients**: Kusto integration for real-time data
- **📈 Historical Tracking**: Coefficient trend analysis

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Status**: ✅ Production Ready | **Version**: 2.0.0 | **Last Updated**: September 19, 2025
 
```bash
cd portal
npm run lint
```

## Project Structure

```text
root
├─ portal/                  # React + Vite frontend (main application)
├─ doc/                     # Design documentation
└─ .github/workflows/       # CI workflow for portal build & deployment
```

## Deployment

GitHub Actions workflow automatically builds and deploys the portal to GitHub Pages on every push to main.

**Live Demo**: <https://zouhao790930.github.io/ResourceCalc001/>

## Version

Portal v0.1.0

## License

MIT
