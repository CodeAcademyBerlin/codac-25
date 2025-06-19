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

REM Check and install pnpm if needed
echo 📦 Checking for pnpm...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  pnpm not found, installing...
    
    REM Try installing pnpm using npm
    npm --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Installing pnpm using npm...
        npm install -g pnpm
        if %errorlevel% equ 0 (
            echo ✅ pnpm installed successfully via npm
        ) else (
            echo Failed to install via npm, trying PowerShell method...
            REM Try installing using PowerShell
            powershell -Command "iwr https://get.pnpm.io/install.ps1 -useb | iex"
            if %errorlevel% equ 0 (
                echo ✅ pnpm installed successfully via PowerShell
                echo Note: You may need to restart your terminal
            ) else (
                echo ❌ Failed to install pnpm automatically
                echo.
                echo 🔧 Manual pnpm installation options:
                echo 1. Using npm: npm install -g pnpm
                echo 2. Using PowerShell: iwr https://get.pnpm.io/install.ps1 -useb ^| iex
                echo 3. Using Chocolatey: choco install pnpm
                echo 4. Visit https://pnpm.io/installation for more options
                pause
                exit /b 1
            )
        )
    ) else (
        echo npm not found, trying PowerShell method...
        powershell -Command "iwr https://get.pnpm.io/install.ps1 -useb | iex"
        if %errorlevel% equ 0 (
            echo ✅ pnpm installed successfully via PowerShell
            echo Note: You may need to restart your terminal
        ) else (
            echo ❌ Failed to install pnpm automatically
            echo.
            echo 🔧 Manual pnpm installation options:
            echo 1. Using PowerShell: iwr https://get.pnpm.io/install.ps1 -useb ^| iex
            echo 2. Using Chocolatey: choco install pnpm
            echo 3. Visit https://pnpm.io/installation for more options
            pause
            exit /b 1
        )
    )
) else (
    echo ✅ pnpm detected
)

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