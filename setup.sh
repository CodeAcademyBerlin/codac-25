#!/bin/bash

echo ""
echo "⚔️  CODAC Attack on Titan Setup for Mac/Linux"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Make setup script executable if needed
if [ ! -x "setup.js" ]; then
    chmod +x setup.js 2>/dev/null || true
fi

# Run the main setup script
echo "Running setup script..."
node setup.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Setup failed! Check the error messages above."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run: pnpm dev"
echo "2. Open: http://localhost:3000"
echo "" 