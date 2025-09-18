@echo off
REM Quick deploy script for ResourceCalc Portal (Windows)

echo 🚀 Building ResourceCalc Portal for sharing...

REM Navigate to portal directory
cd /d "%~dp0portal"

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build production bundle
echo 🔨 Building production bundle...
npm run build

REM Create ZIP package
cd ..
echo 📦 Creating shareable package...
powershell -Command "Compress-Archive -Path 'portal\dist\*' -DestinationPath 'resourcecalc-portal-shared.zip' -Force"

echo ✅ Done! Share the ZIP file or deploy the dist/ folder to any web server.
echo.
echo 📋 Sharing options:
echo    1. Send: resourcecalc-portal-shared.zip
echo    2. Host: Upload portal/dist/ to any web server
echo    3. GitHub Pages: Push to GitHub and enable Pages
echo.
echo 💡 Recipients can extract and serve with:
echo    npx serve . -p 3000
echo    python -m http.server 3000
echo.
pause