#!/bin/bash

# E-Certify Program Deployment Script
echo "🚀 Deploying E-Certify Program to Solana Devnet..."

# Set Solana network to devnet
solana config set --url devnet

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install Solana CLI first."
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo not found. Please install Rust first."
    exit 1
fi

# Navigate to program directory
cd program

# Build the program
echo "📦 Building program..."
cargo build-bpf

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the code."
    exit 1
fi

# Deploy the program
echo "🚀 Deploying program to Devnet..."
PROGRAM_ID=$(solana program deploy target/deploy/e_certify.so --program-id ECertifyProgram111111111111111111111111111111111)

if [ $? -eq 0 ]; then
    echo "✅ Program deployed successfully!"
    echo "📋 Program ID: $PROGRAM_ID"
    
    # Update program ID in frontend
    cd ../frontend
    echo "NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID" > .env.local
    echo "NEXT_PUBLIC_SOLANA_NETWORK=devnet" >> .env.local
    echo "✅ Frontend environment updated"
    
    # Go back to root
    cd ..
    
    echo ""
    echo "🎉 Deployment complete!"
    echo "📝 Next steps:"
    echo "   1. Run 'cd frontend && npm run dev' to start the frontend"
    echo "   2. Connect your wallet to Devnet"
    echo "   3. Test the issuer registration"
else
    echo "❌ Deployment failed. Please check the logs."
    exit 1
fi


