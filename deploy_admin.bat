@echo off
title Trendify Admin Web Deployment Portal
echo ======================================================
echo           TRENDIFY ADMIN WEB DEPLOYMENT PORTAL
echo ======================================================
echo.

:: Add portable Node.js directory to PATH if it exists
if exist "C:\Users\Administrator\node" (
    set "PATH=C:\Users\Administrator\node;%PATH%"
)

echo [1/3] Dang build ma nguon Web Admin...
cd admin-web
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build ma nguon that bai! Vui long kiem tra lai code.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Build completed!
echo.
echo [2/3] Dang thuc hien kiem tra dang nhap Firebase...
call npx firebase-tools login
echo.
echo [3/3] Dang tien hanh deploy len Firebase Hosting (ketnoifirebase-3a966)...
call npx firebase-tools deploy --only hosting --project ketnoifirebase-3a966
echo.
echo ======================================================
echo           DEPLOY HOAN TAT!
echo           Link Web: https://ketnoifirebase-3a966.web.app
echo ======================================================
pause
