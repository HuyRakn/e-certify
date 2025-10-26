#!/bin/bash

echo "🚀 E-Certify MVP Test and Deploy Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "program/Cargo.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Step 1: Build the Solana program
echo "📦 Building Solana program..."
cd program

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo not found. Please install Rust first."
    exit 1
fi

# Build the program
cargo build-bpf

if [ $? -ne 0 ]; then
    echo "❌ Program build failed. Please check the code."
    exit 1
fi

echo "✅ Program built successfully!"

# Step 2: Deploy to Devnet
echo "🚀 Deploying program to Devnet..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install Solana CLI first."
    exit 1
fi

# Set to devnet
solana config set --url devnet

# Check if wallet is configured
if ! solana address &> /dev/null; then
    echo "❌ No Solana wallet configured. Please run 'solana-keygen new' first."
    exit 1
fi

# Deploy the program
PROGRAM_ID=$(solana program deploy target/deploy/e_certify.so --program-id ECertifyProgram111111111111111111111111111111111)

if [ $? -eq 0 ]; then
    echo "✅ Program deployed successfully!"
    echo "📋 Program ID: $PROGRAM_ID"
else
    echo "❌ Deployment failed. Please check the logs."
    exit 1
fi

# Step 3: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

npm install

if [ $? -ne 0 ]; then
    echo "❌ Frontend dependencies installation failed."
    exit 1
fi

echo "✅ Frontend dependencies installed!"

# Step 4: Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env.local << EOF
NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_HELIUS_API_KEY=your-helius-api-key-here
EOF

echo "✅ Environment file created!"

# Step 5: Start the development server
echo "🌐 Starting development server..."
echo ""
echo "🎉 E-Certify MVP is ready!"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Connect your Phantom wallet to Devnet"
echo "   3. Test the Admin Dashboard to register as issuer"
echo "   4. Test the Student Wallet to view credentials"
echo "   5. Test the Verifier Portal to verify credentials"
echo ""
echo "🔧 Configuration:"
echo "   - Program ID: $PROGRAM_ID"
echo "   - Network: Devnet"
echo "   - Frontend: http://localhost:3000"
echo ""

# Start the development server
npm run dev

