@echo off
start "Bakery Backend" cmd /k "cd /d %~dp0backend && npm run dev"
start "Bakery Frontend" cmd /k "cd /d %~dp0bakery-frontend && npm start"
echo Ambos servicios iniciados. Revisa las ventanas abiertas.
