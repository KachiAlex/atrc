@echo off
echo Setting up environment variables for ATRC Firebase App...
echo.

REM Copy the example file to create .env
copy env.example .env

echo.
echo ✅ Environment file created successfully!
echo.
echo Your Firebase configuration is now ready with project ID: atrc-3326f
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Run: npm start
echo 3. Your app will be available at: http://localhost:3000
echo.
pause
