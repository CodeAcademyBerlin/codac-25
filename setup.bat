@echo off
echo.
echo ⚔️  CODAC Attack on Titan Setup for Windows
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18 or higher from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Run the main setup script
echo Running setup script...
node setup.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Setup failed! Check the error messages above.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Run: pnpm dev
echo 2. Open: http://localhost:3000
echo.
pause 