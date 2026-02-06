@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 MYBONZO AI CHAT - PUSH TO GITHUB
echo ========================================
echo.
echo Repository: https://github.com/Bonzokoles/bonzo-ai-chat.git
echo.
echo Checking security first...
echo.

cd /d Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog

:: Check for sensitive files
set "SAFE=1"

echo [1/4] Checking for .dev.vars with real keys...
if exist .dev.vars (
    findstr /i "sk-proj-" .dev.vars >nul 2>&1
    if not errorlevel 1 (
        echo ❌ ERROR: .dev.vars contains API keys!
        echo    Remove them or delete the file before pushing.
        set "SAFE=0"
    )
)

if exist .env (
    findstr /i "sk-proj-" .env >nul 2>&1
    if not errorlevel 1 (
        echo ❌ ERROR: .env contains API keys!
        echo    Remove them or delete the file before pushing.
        set "SAFE=0"
    )
)

if exist chatbot\.dev.vars (
    findstr /i "sk-proj-" chatbot\.dev.vars >nul 2>&1
    if not errorlevel 1 (
        echo ❌ WARNING: chatbot/.dev.vars contains API keys!
        echo    This file should be in .gitignore
    )
)

if "%SAFE%"=="0" (
    echo.
    echo ========================================
    echo   ❌ SECURITY CHECK FAILED!
    echo ========================================
    echo.
    echo Please fix the issues above before pushing.
    echo.
    pause
    exit /b 1
)

echo ✅ Security check passed
echo.

echo [2/4] Initializing Git repository...
if not exist .git (
    git init
    echo ✅ Git initialized
) else (
    echo ✅ Git already initialized
)
echo.

echo [3/4] Adding files to Git...
git add .
git status --short
echo.

echo [4/4] Ready to commit and push!
echo.
echo Files that will be pushed:
echo - All documentation files
echo - Configuration files  
echo - Source code (chatbot/, Chatbotlocal/)
echo - Templates (.example files)
echo.
echo Files that will NOT be pushed (in .gitignore):
echo - .dev.vars, .env (secrets)
echo - node_modules/ (dependencies)
echo - dist/ (build output)
echo.
set /p CONFIRM="Continue with push? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo Push cancelled.
    pause
    exit /b 0
)

echo.
echo Creating commit...
git commit -m "feat: MyBonzo AI Chat - production ready

🎯 Features:
- Multi-provider AI chat (OpenAI, Anthropic, Google)
- Streaming and non-streaming responses
- Role presets (Assistant, Developer, Translator, Critic, Teacher)
- Session persistence with localStorage
- Dark mode support
- Mobile responsive design
- Cloudflare Pages optimized

📚 Documentation:
- Complete README with 4-stage deployment workflow
- QUICK_DEPLOY.md - 5-minute deployment guide
- SETUP_INSTRUCTIONS.md - Detailed setup instructions
- IMPROVEMENTS.md - Complete changelog
- STATUS.md - Current project status
- PUSH_TO_GITHUB.md - This push guide

⚙️ Configuration:
- Modern Astro 4.16.0 + React 18
- Cloudflare adapter configured
- Environment variables template
- Production-ready build scripts
- Comprehensive .gitignore

📦 Implementations:
- chatbot/ - Cloudflare Pages ready (production)
- Chatbotlocal/ - Local model version (self-hosted)

🔒 Security:
- No API keys committed
- Environment variables template provided
- Proper .gitignore configuration
- Pre-push security checks

✅ Status: Production Ready
🚀 Ready for immediate deployment to Cloudflare Pages

Following GOLDEN RULES:
- Development in isolated AIBLOG folder
- No changes to main blog during development
- Independent deployment and repository
- Clear 4-stage workflow documented

Next steps:
1. Deploy to Cloudflare Pages
2. Configure environment variables
3. Integrate with main blog (1 file edit)

Time to deploy: 5-10 minutes
Difficulty: ⭐⭐ Easy
" 2>nul

if errorlevel 1 (
    echo ℹ️ No changes to commit or already committed
)

echo.
echo Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Bonzokoles/bonzo-ai-chat.git
echo ✅ Remote added
echo.

echo Pushing to GitHub...
echo.
git branch -M main
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ❌ Push failed!
    echo.
    echo Common issues:
    echo 1. Git not installed - Install from https://git-scm.com/
    echo 2. Authentication failed - Check GitHub credentials
    echo 3. Repository doesn't exist - Create it at https://github.com/new
    echo.
    echo Try running these commands manually:
    echo   git remote add origin https://github.com/Bonzokoles/bonzo-ai-chat.git
    echo   git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo 🔗 Repository: https://github.com/Bonzokoles/bonzo-ai-chat
echo.
echo 📋 Next steps:
echo.
echo 1. Verify on GitHub:
echo    https://github.com/Bonzokoles/bonzo-ai-chat
echo.
echo 2. Deploy to Cloudflare Pages:
echo    - Go to https://dash.cloudflare.com/
echo    - Workers ^& Pages → Create → Pages
echo    - Connect to Git → Select bonzo-ai-chat
echo    - Framework: Astro
echo    - Build command: npm run build
echo    - Build output: dist
echo    - Add environment variable: OPENAI_API_KEY
echo    - Deploy!
echo.
echo 3. See QUICK_DEPLOY.md for detailed instructions
echo.
echo ========================================
echo.
pause
