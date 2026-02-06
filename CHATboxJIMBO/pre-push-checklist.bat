@echo off
echo ========================================
echo PRE-PUSH SECURITY CHECKLIST
echo ========================================
echo.

cd /d Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog

echo Checking for sensitive files...
echo.

set "ISSUES_FOUND=0"

if exist .dev.vars (
    echo [WARNING] .dev.vars exists - checking if in .gitignore...
    findstr /i ".dev.vars" .gitignore >nul
    if errorlevel 1 (
        echo [ERROR] .dev.vars NOT in .gitignore! Add it before pushing!
        set "ISSUES_FOUND=1"
    ) else (
        echo [OK] .dev.vars is in .gitignore
    )
) else (
    echo [OK] No .dev.vars file found
)
echo.

if exist .env (
    echo [WARNING] .env exists - checking if in .gitignore...
    findstr /i ".env" .gitignore >nul
    if errorlevel 1 (
        echo [ERROR] .env NOT in .gitignore! Add it before pushing!
        set "ISSUES_FOUND=1"
    ) else (
        echo [OK] .env is in .gitignore
    )
) else (
    echo [OK] No .env file found
)
echo.

echo Checking for API keys in files...
findstr /s /i "sk-proj-" *.* 2>nul | findstr /v ".example" | findstr /v ".bat" | findstr /v ".md"
if not errorlevel 1 (
    echo [ERROR] Found potential API keys in files! Remove them before pushing!
    set "ISSUES_FOUND=1"
) else (
    echo [OK] No API keys found in tracked files
)
echo.

echo Checking for node_modules...
if exist node_modules (
    echo [WARNING] node_modules exists - checking if in .gitignore...
    findstr /i "node_modules" .gitignore >nul
    if errorlevel 1 (
        echo [ERROR] node_modules NOT in .gitignore! Add it before pushing!
        set "ISSUES_FOUND=1"
    ) else (
        echo [OK] node_modules is in .gitignore
    )
) else (
    echo [OK] No node_modules found
)
echo.

echo Checking .gitignore exists...
if exist .gitignore (
    echo [OK] .gitignore exists
) else (
    echo [ERROR] .gitignore missing! Create it before pushing!
    set "ISSUES_FOUND=1"
)
echo.

echo ========================================
if "%ISSUES_FOUND%"=="1" (
    echo [FAILED] Security issues found! Fix them before pushing!
    echo ========================================
    pause
    exit /b 1
) else (
    echo [PASSED] All security checks passed!
    echo ========================================
    echo.
    echo Safe to push to GitHub.
    echo Run push-to-github.bat to continue.
    echo.
    pause
    exit /b 0
)
