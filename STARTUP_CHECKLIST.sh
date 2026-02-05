#!/bin/bash
# Quick Start Checklist

echo "✅ AI Chat Pro - Pre-Deployment Checklist"
echo "=========================================="
echo ""

# Check 1: Dependencies
echo "1. Checking npm packages..."
if npm list ethers > /dev/null 2>&1; then
    echo "   ✓ ethers.js installed"
else
    echo "   ✗ ethers.js NOT installed - run: npm install"
fi

# Check 2: Environment file
echo "2. Checking environment configuration..."
if [ -f .env.local ]; then
    echo "   ✓ .env.local exists"
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA" .env.local; then
        if grep -q "^NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x" .env.local && ! grep -q "^NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x$" .env.local; then
            echo "   ✓ Contract addresses configured"
        else
            echo "   ⚠ Contract addresses not set - update .env.local after deploying contract"
        fi
    fi
else
    echo "   ✗ .env.local NOT found"
fi

# Check 3: Contract file
echo "3. Checking smart contract..."
if [ -f contracts/SubscriptionManager.sol ]; then
    echo "   ✓ SubscriptionManager.sol exists"
else
    echo "   ✗ SubscriptionManager.sol NOT found"
fi

# Check 4: Required pages
echo "4. Checking application pages..."
for page in "subscription" "stats" "settings"; do
    if [ -f "app/$page/page.tsx" ]; then
        echo "   ✓ $page page exists"
    else
        echo "   ✗ $page page NOT found"
    fi
done

# Check 5: Redux slices
echo "5. Checking Redux state..."
for slice in "walletSlice" "subscriptionSlice" "chatSlice"; do
    if [ -f "lib/redux/slices/$slice.ts" ]; then
        echo "   ✓ $slice exists"
    else
        echo "   ✗ $slice NOT found"
    fi
done

echo ""
echo "📋 Next Steps:"
echo "   1. Deploy SubscriptionManager.sol to Sepolia testnet"
echo "   2. Update .env.local with deployed contract address"
echo "   3. Add OpenAI API key to .env.local"
echo "   4. Run: npm install"
echo "   5. Run: npm run build"
echo "   6. Run: npm run dev (for development)"
echo "   7. Test with MetaMask on Sepolia network"
echo ""
echo "🚀 To deploy to production:"
echo "   1. Deploy contract to Ethereum Mainnet/Polygon"
echo "   2. Update all contract addresses in .env.local"
echo "   3. Deploy to Vercel/hosting: git push"
echo ""
