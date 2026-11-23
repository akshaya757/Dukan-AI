# kill-servers.ps1 — Run this whenever ports 5173 or 8080 are stuck
Write-Host "Checking ports 5173 and 8080..." -ForegroundColor Cyan

$ports = @(5173, 8080)
foreach ($port in $ports) {
    $pid = (netstat -ano | Select-String ":$port " | Where-Object { $_ -match "LISTENING" } | ForEach-Object { ($_ -split "\s+")[-1] } | Select-Object -First 1)
    if ($pid) {
        Write-Host "Killing PID $pid on port $port..." -ForegroundColor Yellow
        taskkill /PID $pid /F 2>$null
        Write-Host "Port $port cleared." -ForegroundColor Green
    } else {
        Write-Host "Port $port is already free." -ForegroundColor Green
    }
}
Write-Host "`nDone! You can now run:" -ForegroundColor Cyan
Write-Host "  Backend:  mvn spring-boot:run" -ForegroundColor White
Write-Host "  Frontend: npm run dev" -ForegroundColor White
