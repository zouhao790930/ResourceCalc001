# ResourceCalc Portal - Quick Start Guide

## 🚀 Try the Portal (3 Ways)

### Option 1: Online Demo (Easiest)
**Live Demo**: https://zouhao790930.github.io/ResourceCalc001/
- No installation needed
- Works in any modern browser
- Latest version always available

### Option 2: Download & Run Locally
1. **Download**: Get `resourcecalc-portal-v0.1.0.zip` 
2. **Extract** the zip file
3. **Serve locally**:
   ```bash
   # Method A: Using Node.js (if installed)
   npx serve . -p 3000
   
   # Method B: Using Python (if installed)
   python -m http.server 3000
   
   # Method C: Double-click index.html (basic functionality)
   ```
4. **Open**: http://localhost:3000

### Option 3: Full Development Setup
```bash
# Clone or download the source
git clone https://github.com/zouhao790930/ResourceCalc001.git
cd ResourceCalc001/portal

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:5173/ResourceCalc001/
```

## 📊 What is ResourceCalc Portal?

An interactive web calculator for **Copilot CPU resource estimation** across different scenarios:

- **Offline A/B Testing** (SEVAL scenarios)
- **Shadow A/B Testing** (parallel traffic)
- **Online A/B Delta** (incremental load)
- **Inorganic Growth** (user adoption modeling)

## 🎯 Key Features

✅ **Scenario-based calculations** with realistic defaults  
✅ **Interactive tooltips** for parameter explanations  
✅ **Advanced coefficient tuning** (fan-out, CPU per RPS)  
✅ **Visual results** with CPU distribution charts  
✅ **Keyboard navigation** and accessibility support  
✅ **Professional UI** with hover states and animations  

## 💡 How to Use

1. **Select scenario type** (tabs at top)
2. **Enter parameters** (hover "?" icons for help)
3. **Optionally adjust** Advanced Coefficients
4. **Click "Compute Resources"** 
5. **Review results** table and CPU chart

## 🔧 Technical Details

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Modern CSS with accessibility features
- **Deployment**: Static files (works anywhere)
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

## 📋 Requirements

- **For online demo**: Any modern web browser
- **For local serving**: Node.js OR Python OR any HTTP server
- **For development**: Node.js 18+ and npm

## 🐛 Issues or Questions?

Open an issue at: https://github.com/zouhao790930/ResourceCalc001/issues