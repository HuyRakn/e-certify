# E-Certify Build Script for Windows
# This script builds and runs the E-Certify MVP without Solana CLI

Write-Host "Building E-Certify MVP..." -ForegroundColor Blue

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Rust
try {
    $rustVersion = cargo --version
    Write-Host "Rust found: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "Rust not found. Please install Rust first." -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Build Rust program
Write-Host "Building Rust program..." -ForegroundColor Yellow
Set-Location program

try {
    cargo build
    Write-Host "Rust program built successfully!" -ForegroundColor Green
} catch {
    Write-Host "Rust program build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Setup frontend
Write-Host "Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

# Install dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Frontend dependencies installed!" -ForegroundColor Green
} catch {
    Write-Host "Frontend dependency installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Create environment file
Write-Host "Creating environment configuration..." -ForegroundColor Yellow
$envContent = @"
NEXT_PUBLIC_PROGRAM_ID=ECertifyProgram111111111111111111111111111111111
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_HELIUS_API_KEY=demo-key
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "Environment configuration created!" -ForegroundColor Green

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Frontend built successfully!" -ForegroundColor Green
} catch {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Create demo script
Write-Host "Creating demo script..." -ForegroundColor Yellow
$demoScript = @"
# E-Certify Demo Script
Write-Host "Starting E-Certify Demo..." -ForegroundColor Blue
Write-Host "Opening browser at http://localhost:3000" -ForegroundColor Green

# Start frontend
Set-Location frontend
npm run dev
"@

$demoScript | Out-File -FilePath "start-demo.ps1" -Encoding UTF8
Write-Host "Demo script created!" -ForegroundColor Green

# Create summary
Write-Host "Creating deployment summary..." -ForegroundColor Yellow
$summary = @"
# E-Certify MVP Build Summary

## Build Status: SUCCESS

### What's Ready:
- Rust program compiled successfully
- Frontend built and ready
- Environment configured
- Demo script created

### How to Run:
1. Run: .\start-demo.ps1
2. Open: http://localhost:3000
3. Test all three user flows:
   - Admin Dashboard (Issuer Registration)
   - Student Wallet (Credential Viewing)  
   - Verifier Portal (Credential Verification)

### Demo Features:
- Mock data for demonstration
- Professional UI/UX
- Responsive design
- QR code generation
- Credential sharing

### Note:
This is a demo version that works without Solana CLI.
For production deployment, you'll need Solana CLI installed.

---
Built on: $(Get-Date)
"@

$summary | Out-File -FilePath "BUILD_SUMMARY.md" -Encoding UTF8

Write-Host ""
Write-Host "E-Certify MVP Build Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Blue
Write-Host "   - Rust program compiled" -ForegroundColor White
Write-Host "   - Frontend built and ready" -ForegroundColor White
Write-Host "   - Demo script created" -ForegroundColor White
Write-Host "   - Ready for presentation" -ForegroundColor White
Write-Host ""
Write-Host "To start the demo:" -ForegroundColor Blue
Write-Host "   .\start-demo.ps1" -ForegroundColor White
Write-Host ""
Write-Host "For details:" -ForegroundColor Blue
Write-Host "   Get-Content BUILD_SUMMARY.md" -ForegroundColor White
Write-Host ""
Write-Host "Ready for hackathon presentation!" -ForegroundColor Green