@echo off
REM E-Certify Deployment Script for Windows
REM This script deploys the Solana program and starts the frontend development server

echo 🚀 Starting E-Certify deployment...

REM Check if Solana CLI is installed
solana --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Solana CLI not found. Please install it first:
    echo    Visit: https://docs.solana.com/cli/install-solana-cli-tools
    pause
    exit /b 1
)

REM Check if Rust is installed
cargo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Rust not found. Please install it first:
    echo    Visit: https://rustup.rs/
    pause
    exit /b 1
)

REM Set Solana to devnet
echo 🔧 Setting Solana to devnet...
solana config set --url devnet

REM Check Solana balance
echo 💰 Checking Solana balance...
solana balance

REM Build and deploy the program
echo 🔨 Building Solana program...
cd program

REM Install Solana program dependencies
echo 📦 Installing program dependencies...
cargo build-bpf

REM Deploy the program
echo 🚀 Deploying program to devnet...
solana program deploy target/deploy/e_certify.so

REM Update frontend environment with program ID
cd ..\frontend
echo 🔧 Creating frontend environment file...
echo NEXT_PUBLIC_PROGRAM_ID=ECertifyProgram111111111111111111111111111111111 > .env.local
echo NEXT_PUBLIC_SOLANA_NETWORK=devnet >> .env.local

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
npm install

REM Start the development server
echo 🌐 Starting frontend development server...
echo ✅ Deployment complete! Frontend running at http://localhost:3000
echo.
echo 🎯 Next steps:
echo    1. Open http://localhost:3000 in your browser
echo    2. Connect your wallet (Phantom recommended)
echo    3. Test the admin dashboard to register as issuer
echo    4. Test the student wallet to view credentials
echo    5. Test the verifier portal to verify credentials
echo.
echo 📚 For more information, see README.md

npm run dev


