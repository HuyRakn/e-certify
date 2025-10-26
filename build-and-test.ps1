Write-Host "🚀 Building E-Certify MVP..." -ForegroundColor Green

# Build Rust program
Write-Host "📦 Building Rust program..." -ForegroundColor Yellow
Set-Location program
cargo build-bpf
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Rust program build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Rust program built successfully" -ForegroundColor Green

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependencies installation failed" -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Linting issues found, but continuing..." -ForegroundColor Yellow
}

Write-Host "🎉 E-Certify MVP build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Build Summary:" -ForegroundColor Cyan
Write-Host "✅ Rust program compiled" -ForegroundColor Green
Write-Host "✅ Frontend built" -ForegroundColor Green
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready to deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the demo:" -ForegroundColor Cyan
Write-Host "1. cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. Open http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To deploy the program:" -ForegroundColor Cyan
Write-Host "1. solana program deploy program/target/deploy/e_certify.so" -ForegroundColor White
Write-Host "2. Update PROGRAM_ID in frontend/utils/ecertify.ts" -ForegroundColor White

