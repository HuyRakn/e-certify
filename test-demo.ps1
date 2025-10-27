# E-Certify Demo Test Script
Write-Host "Starting E-Certify Demo Test..." -ForegroundColor Green

# Check if frontend is running
Write-Host "Checking frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend server is running at http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend server is not running. Please start it with: cd frontend; npm run dev" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Demo Instructions:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Connect your Solana wallet (Phantom recommended)" -ForegroundColor White
Write-Host "3. Test Admin Dashboard:" -ForegroundColor White
Write-Host "   - Register as issuer (APEC University)" -ForegroundColor Gray
Write-Host "   - Create credential batch" -ForegroundColor Gray
Write-Host "   - Upload sample_students.csv to mint credentials" -ForegroundColor Gray
Write-Host "4. Test Student Wallet:" -ForegroundColor White
Write-Host "   - Connect wallet with address from CSV" -ForegroundColor Gray
Write-Host "   - View credentials (may be empty if no real cNFTs minted)" -ForegroundColor Gray
Write-Host "5. Test Verifier Portal:" -ForegroundColor White
Write-Host "   - Enter asset ID manually" -ForegroundColor Gray
Write-Host "   - Test verification process" -ForegroundColor Gray

Write-Host ""
Write-Host "Sample CSV Data:" -ForegroundColor Cyan
Write-Host "wallet_address,student_name,student_internal_id" -ForegroundColor White
Write-Host "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM,John Doe,12345" -ForegroundColor White
Write-Host "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1,Jane Smith,12346" -ForegroundColor White

Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "- If wallet connection fails, make sure Phantom is installed" -ForegroundColor White
Write-Host "- If DAS API fails, credentials will show as empty (expected for demo)" -ForegroundColor White
Write-Host "- Check browser console for detailed error messages" -ForegroundColor White

Write-Host ""
Write-Host "Demo is ready! Open http://localhost:3000 to start testing." -ForegroundColor Green