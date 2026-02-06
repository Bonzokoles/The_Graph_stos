@echo off
cd /d Q:\mybonzo\mybonzoAIBLOG_COMONENTS\01-ai-blog

echo.
echo ========================================
echo   PUSH TO GITHUB
echo ========================================
echo.

echo Initializing Git...
git init

echo.
echo Adding files...
git add .

echo.
echo Creating commit...
git commit -m "feat: MyBonzo AI Chat - production ready with complete documentation and scripts"

echo.
echo Adding remote...
git remote remove origin 2>nul
git remote add origin https://github.com/Bonzokoles/bonzo-ai-chat.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Check: https://github.com/Bonzokoles/bonzo-ai-chat
echo.
pause
