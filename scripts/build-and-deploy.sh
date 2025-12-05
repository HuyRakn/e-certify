#!/bin/bash
# Script to build and deploy Anchor program to Devnet

set -e

echo "🔨 Building Anchor program..."
anchor build

echo ""
echo "📦 Deploying to Devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Update your .env.local with the Program ID if it changed:"
echo "   ANCHOR_PROGRAM_ID=<program_id>"

