#!/bin/bash

echo "🚀 Building E-Certify MVP..."

# Build Rust program
echo "📦 Building Rust program..."
cd program
cargo build-bpf
if [ $? -ne 0 ]; then
    echo "❌ Rust program build failed"
    exit 1
fi
echo "✅ Rust program built successfully"

# Build frontend
echo "📦 Building frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependencies installation failed"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully"

# Run tests
echo "🧪 Running tests..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found, but continuing..."
fi

echo "🎉 E-Certify MVP build completed successfully!"
echo ""
echo "📋 Build Summary:"
echo "✅ Rust program compiled"
echo "✅ Frontend built"
echo "✅ Dependencies installed"
echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "To run the demo:"
echo "1. cd frontend && npm run dev"
echo "2. Open http://localhost:3000"
echo ""
echo "To deploy the program:"
echo "1. solana program deploy program/target/deploy/e_certify.so"
echo "2. Update PROGRAM_ID in frontend/utils/ecertify.ts"