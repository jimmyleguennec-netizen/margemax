@echo off
title MargeMax
cd /d "%~dp0"
echo.
echo ============================================
echo     MARGEMAX - DEMARRAGE
echo ============================================
echo.
python --version
if errorlevel 1 (
  echo Python n'est pas installe ou n'est pas dans le PATH.
  pause
  exit /b 1
)
python -m pip install --disable-pip-version-check -r requirements.txt
if errorlevel 1 (
  echo.
  echo Erreur pendant l'installation des dependances.
  pause
  exit /b 1
)
echo.
echo Lancement de MargeMax...
python -m streamlit run app.py
pause
