@echo off
echo =====================================================
echo     PEERLearn - P2P Learning Platform Launcher
echo =====================================================
echo.
echo [1/3] Starting MongoDB Service...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
  echo.
  echo  WARNING: MongoDB service not found or could not start.
  echo.
  echo  Please install MongoDB Community Server:
  echo  >> https://www.mongodb.com/try/download/community
  echo  >> Choose: Windows x64, MSI package
  echo  >> Make sure to install as a Service during setup
  echo.
  echo  OR if already installed, start it manually:
  echo  >> Open Services (services.msc) and start "MongoDB"
  echo.
  pause
)

echo.
echo [2/3] Starting Backend Server (Express + MongoDB)...
start "PEER Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend Server (React + Vite)...
start "PEER Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo =====================================================
echo  Both servers are starting in separate windows!
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo.
echo  Admin Login: admin@gmail.com / admin123
echo =====================================================
echo.
start http://localhost:5173
pause
