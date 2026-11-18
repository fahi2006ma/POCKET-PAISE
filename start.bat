@echo off
echo ===================================================
echo Starting Pocket Paise Application (Django + React)
echo ===================================================

start "Pocket Paise Backend (Django)" cmd /k "cd /d %~dp0backend && python manage.py runserver 127.0.0.1:8000"

timeout /t 2 /nobreak >nul

start "Pocket Paise Frontend (React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Pocket Paise is starting up!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000/api/v1/
echo Demo Account: dreamer@pocketpaise.com / Password123!
echo.
pause
