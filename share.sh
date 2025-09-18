#!/bin/bash
# Quick deploy script for ResourceCalc Portal

set -e

echo "🚀 Building ResourceCalc Portal for sharing..."

# Navigate to portal directory
cd "$(dirname "$0")/portal"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build production bundle
echo "🔨 Building production bundle..."
npm run build

# Create ZIP package
cd ..
echo "📦 Creating shareable package..."
zip -r "resourcecalc-portal-v$(date +%Y%m%d).zip" portal/dist/*

echo "✅ Done! Share the ZIP file or deploy the dist/ folder to any web server."
echo ""
echo "📋 Sharing options:"
echo "   1. Send: resourcecalc-portal-v$(date +%Y%m%d).zip"
echo "   2. Host: Upload portal/dist/ to any web server"
echo "   3. GitHub Pages: Push to GitHub and enable Pages"
echo ""
echo "💡 Recipients can extract and serve with:"
echo "   npx serve . -p 3000"
echo "   python -m http.server 3000"