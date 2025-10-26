#!/bin/bash

# E-Certify Deployment Script
# This script deploys the Solana program and starts the frontend development server

set -e

echo "🚀 Starting E-Certify deployment..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first:"
    echo "   sh -c \"\$(curl -sSfL https://release.solana.com/v1.18.0/install)\""
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found. Please install it first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Set Solana to devnet
echo "🔧 Setting Solana to devnet..."
solana config set --url devnet

# Check Solana balance
echo "💰 Checking Solana balance..."
BALANCE=$(solana balance)
echo "Current balance: $BALANCE SOL"

if [ "$BALANCE" = "0 SOL" ]; then
    echo "⚠️  No SOL found. Requesting airdrop..."
    solana airdrop 2
    echo "✅ Airdrop completed"
fi

# Build and deploy the program
echo "🔨 Building Solana program..."
cd program

# Install Solana program dependencies
echo "📦 Installing program dependencies..."
cargo build-bpf

# Deploy the program
echo "🚀 Deploying program to devnet..."
PROGRAM_ID=$(solana program deploy target/deploy/e_certify.so --output json | jq -r '.programId')
echo "✅ Program deployed with ID: $PROGRAM_ID"

# Update frontend environment with program ID
cd ../frontend
echo "🔧 Updating frontend environment..."
echo "NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID" > .env.local
echo "NEXT_PUBLIC_SOLANA_NETWORK=devnet" >> .env.local

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Start the development server
echo "🌐 Starting frontend development server..."
echo "✅ Deployment complete! Frontend running at http://localhost:3000"
echo "📋 Program ID: $PROGRAM_ID"
echo ""
echo "🎯 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Connect your wallet (Phantom recommended)"
echo "   3. Test the admin dashboard to register as issuer"
echo "   4. Test the student wallet to view credentials"
echo "   5. Test the verifier portal to verify credentials"
echo ""
echo "📚 For more information, see README.md"

npm run dev


