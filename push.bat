@echo off
REM =====================================================
REM 🚀 GIT AUTO CLEAN + PUSH SCRIPT (FRESH UPLOAD)
REM For: Jobtica project by Basil
REM =====================================================

set REPO_URL=https://github.com/basilraj/Jobtica.git
set BRANCH=main

echo ---------------------------------------
echo 🔥 Deleting old Git history...
echo ---------------------------------------

rmdir /s /q .git

echo ---------------------------------------
echo 🧩 Re-initializing repository...
echo ---------------------------------------

git init
git add .
git commit -m "🚀 Fresh upload on %date% at %time%"
git branch -M %BRANCH%
git remote add origin %REPO_URL%

echo ---------------------------------------
echo ⏫ Pushing new files to GitHub (force)...
echo ---------------------------------------

git push -u origin %BRANCH% --force

echo ---------------------------------------
echo ✅ Done! Old repo replaced with new project.
pause
