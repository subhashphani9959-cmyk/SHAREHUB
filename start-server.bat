@echo off
REM ShareHub Local Server Launcher
REM This batch file will start a local HTTP server for ShareHub

echo.
echo ========================================
echo   ShareHub - File Sharing Application
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting ShareHub with Python HTTP Server...
    echo.
    echo Opening in your browser in 2 seconds...
    echo Access URL: http://localhost:8000
    echo.
    timeout /t 2 /nobreak
    start http://localhost:8000
    python -m http.server 8000
) else (
    echo Python is not installed or not in PATH.
    echo.
    echo You can still use ShareHub by:
    echo 1. Opening index.html directly in your browser
    echo 2. Or installing Python from: https://www.python.org/
    echo.
    pause
    start index.html
)
