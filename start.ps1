Write-Host "===================================================" -ForegroundColor Green
Write-Host "Starting Pocket Paise Application (Django + React)" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; python manage.py runserver 127.0.0.1:8000"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev"

Write-Host ""
Write-Host "Pocket Paise is running!" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend API: http://127.0.0.1:8000/api/v1/" -ForegroundColor Yellow
Write-Host "Demo user:   dreamer@pocketpaise.com / Password123!" -ForegroundColor White
