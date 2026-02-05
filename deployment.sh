#!/bin/bash
# deployment.sh - Quick start deployment script

echo "🚀 AI Chat Pro - Deployment Setup"
echo "=================================="

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Run build
echo "🔨 Building application..."
npm run build

# Step 3: Generate environment template
echo "⚙️  Setting up environment..."
if [ ! -f .env.local ]; then
  echo "Creating .env.local template..."
  cat > .env.local << 'EOF'
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET=0x
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x
NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON=0x
NEXT_PUBLIC_CONTRACT_ADDRESS_AMOY=0x

# OpenAI Configuration
OPENAI_API_KEY=

# Admin wallet address
NEXT_PUBLIC_ADMIN_ADDRESS=

# Default network
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia
EOF
  echo "✅ .env.local created. Please fill in your contract addresses and API keys"
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Deploy SubscriptionManager.sol contract to your chosen network"
echo "2. Update .env.local with deployed contract addresses"
echo "3. Run 'npm run dev' to start development server"
echo "4. Run 'npm start' for production"
echo ""
echo "Smart Contract Deployment:"
echo "- Contract file: contracts/SubscriptionManager.sol"
echo "- Deploy with: Hardhat, Truffle, or Remix"
echo "- Constructor parameter: Treasury wallet address"
echo ""
