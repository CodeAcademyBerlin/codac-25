#!/bin/bash

echo ""
echo "⚔️  CODAC Attack on Titan Setup for Mac/Linux"
echo "=============================================="
echo ""

# Check if running on macOS and warn about admin privileges
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected"
    echo "⚠️  Note: This setup may require administrator privileges to install pnpm globally."
    echo "   You may be prompted for your password during the installation process."
    echo ""
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Function to install pnpm with proper permissions
install_pnpm_with_sudo() {
    local method=$1
    local command=$2
    
    echo "Installing pnpm using $method..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🔐 Administrator privileges required for global pnpm installation on macOS"
        echo "   Please enter your password when prompted:"
        sudo $command
    else
        $command
    fi
}

# Check and install pnpm if needed
echo "📦 Checking for pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found, installing..."
    
    # Try installing pnpm using npm first
    if command -v npm &> /dev/null; then
        install_pnpm_with_sudo "npm" "npm install -g pnpm"
        if [ $? -eq 0 ]; then
            echo "✅ pnpm installed successfully via npm"
        else
            echo "Failed to install via npm, trying user-level curl method..."
            # Try installing using the official install script (user-level)
            curl -fsSL https://get.pnpm.io/install.sh | sh -
            if [ $? -eq 0 ]; then
                # Source the shell profile to make pnpm available
                export PATH="$HOME/.local/share/pnpm:$PATH"
                echo "✅ pnpm installed successfully via curl (user-level)"
                echo "📝 Adding pnpm to your PATH..."
                
                # Add to shell profile for persistence
                if [[ "$SHELL" == *"zsh"* ]]; then
                    echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.zshrc
                    echo "   Added to ~/.zshrc"
                elif [[ "$SHELL" == *"bash"* ]]; then
                    echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.bashrc
                    echo "   Added to ~/.bashrc"
                fi
                
                echo "🔄 Note: You may need to restart your terminal or run:"
                if [[ "$SHELL" == *"zsh"* ]]; then
                    echo "   source ~/.zshrc"
                else
                    echo "   source ~/.bashrc"
                fi
            else
                echo "❌ Failed to install pnpm automatically"
                echo ""
                echo "🔧 Manual pnpm installation options:"
                echo "1. Using npm: sudo npm install -g pnpm"
                echo "2. Using curl: curl -fsSL https://get.pnpm.io/install.sh | sh -"
                echo "3. Using Homebrew (Mac): brew install pnpm"
                echo "4. Visit https://pnpm.io/installation for more options"
                exit 1
            fi
        fi
    else
        echo "npm not found, trying user-level curl method..."
        curl -fsSL https://get.pnpm.io/install.sh | sh -
        if [ $? -eq 0 ]; then
            export PATH="$HOME/.local/share/pnpm:$PATH"
            echo "✅ pnpm installed successfully via curl (user-level)"
            echo "📝 Adding pnpm to your PATH..."
            
            # Add to shell profile for persistence
            if [[ "$SHELL" == *"zsh"* ]]; then
                echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.zshrc
                echo "   Added to ~/.zshrc"
            elif [[ "$SHELL" == *"bash"* ]]; then
                echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.bashrc
                echo "   Added to ~/.bashrc"
            fi
            
            echo "🔄 Note: You may need to restart your terminal or run:"
            if [[ "$SHELL" == *"zsh"* ]]; then
                echo "   source ~/.zshrc"
            else
                echo "   source ~/.bashrc"
            fi
        else
            echo "❌ Failed to install pnpm automatically"
            echo ""
            echo "🔧 Manual pnpm installation options:"
            echo "1. Using curl: curl -fsSL https://get.pnpm.io/install.sh | sh -"
            echo "2. Using Homebrew (Mac): brew install pnpm"
            echo "3. Visit https://pnpm.io/installation for more options"
            exit 1
        fi
    fi
else
    echo "✅ pnpm detected: $(pnpm --version)"
fi

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