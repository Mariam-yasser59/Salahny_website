@echo off
cd /d C:\Users\Hotline\salahny_project\salahny-web\frontend
call npm.cmd run build
cd /d C:\Users\Hotline\salahny_project\salahny-web\backend
npm.cmd start
