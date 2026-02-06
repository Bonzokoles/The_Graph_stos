@echo off
echo ========================================
echo Pushing 01-ai-blog to GitHub
echo Repository: https://github.com/Bonzokoles/bonzo-ai-chat.git
echo ========================================
echo.

cd /d Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog

echo [1/6] Checking Git status...
git status
echo.

echo [2/6] Initializing Git repository (if needed)...
git init
echo.

echo [3/6] Adding all files...
git add .
echo.

echo [4/6] Creating commit...
git commit -m "feat: MyBonzo AI Chat - production ready

Features:
- Multi-provider AI chat (OpenAI, Anthropic, Google)
- Streaming and non-streaming responses
- Role presets (Assistant, Developer, Translator, etc.)
- Session persistence with localStorage
- Dark mode support
- Mobile responsive design
- Cloudflare Pages optimized

Documentation:
- Complete README with deployment guide
- Quick deploy guide (5 minutes)
- Setup instructions
- Improvements log
- Status report

Configuration:
- Modern Astro 4.16.0 + React
- Cloudflare adapter configured
- Environment variables template
- Production-ready build scripts

Existing implementations:
- chatbot/ - Cloudflare-ready version
- Chatbotlocal/ - Local model version

Ready for immediate deployment!
"
echo.

echo [5/6] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Bonzokoles/bonzo-ai-chat.git
echo.

echo [6/6] Pushing to GitHub...
git branch -M main
git push -u origin main --force
echo.

echo ========================================
echo Done! Check: https://github.com/Bonzokoles/bonzo-ai-chat
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://dash.cloudflare.com/
echo 2. Workers ^& Pages -^> Create -^> Pages -^> Connect to Git
echo 3. Select bonzo-ai-chat repository
echo 4. Deploy!
echo.
pause
