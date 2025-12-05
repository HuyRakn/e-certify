# PowerShell script to build and deploy Anchor program to Devnet

Write-Host "🔨 Building Anchor program..." -ForegroundColor Cyan
anchor build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Deploying to Devnet..." -ForegroundColor Cyan
anchor deploy --provider.cluster devnet

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Update your .env.local with the Program ID if it changed:" -ForegroundColor Yellow
Write-Host "   ANCHOR_PROGRAM_ID=<program_id>" -ForegroundColor Yellow

