@echo off
title Arc Wise - Website
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\nodejs"
cd /d "%~dp0"
echo ================================================
echo   Arc Wise - website wordt gestart...
echo   Een moment, de browser opent automatisch.
echo   (Laat dit venster open zolang je werkt.)
echo ================================================
start "" cmd /c "ping -n 7 127.0.0.1 >nul & start http://localhost:3100"
node node_modules/next/dist/bin/next dev -p 3100
