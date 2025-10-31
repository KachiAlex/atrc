@echo off
echo 🚀 Enhanced Translation System Setup
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    if exist env.example (
        echo 📋 Creating .env file from env.example...
        copy env.example .env >nul
        echo ✅ .env file created successfully!
    ) else (
        echo ❌ env.example file not found. Please create it first.
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file already exists
)

echo.
echo 📋 Next Steps:
echo ==============
echo.
echo 1. 🔑 Get Google Cloud Translation API Key:
echo    - Go to: https://console.cloud.google.com/
echo    - Enable Cloud Translation API
echo    - Create API credentials
echo    - Add key to .env file
echo.
echo 2. 🔥 Configure Firebase Firestore:
echo    - Ensure Firestore is enabled
echo    - Update firestore.rules for translation caching
echo.
echo 3. 🚀 Start your development server:
echo    npm start
echo.
echo 4. 🧪 Test the translation system:
echo    - Open your app in the browser
echo    - Try the "Enhanced Translate" feature
echo    - Test highlight and translate functionality
echo.
echo 📚 For detailed setup instructions, see: TRANSLATION_SETUP_GUIDE.md
echo.
echo 🎉 Your enhanced translation system is ready!
echo.
pause
