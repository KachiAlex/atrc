#!/usr/bin/env node

/**
 * Translation Setup Script
 * Helps configure the enhanced translation system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Enhanced Translation System Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!\n');
  } else {
    console.log('❌ env.example file not found. Please create it first.\n');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Check current API key configuration
const envContent = fs.readFileSync(envPath, 'utf8');
const hasApiKey = envContent.includes('REACT_APP_GOOGLE_TRANSLATE_API_KEY=') && 
                  !envContent.includes('YOUR_GOOGLE_TRANSLATE_API_KEY_HERE');

if (hasApiKey) {
  console.log('✅ Google Translate API key is configured\n');
} else {
  console.log('⚠️  Google Translate API key needs to be configured\n');
  
  rl.question('Do you want to configure the API key now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      rl.question('Enter your Google Cloud Translation API key: ', (apiKey) => {
        if (apiKey.trim()) {
          // Update .env file
          const updatedContent = envContent.replace(
            'REACT_APP_GOOGLE_TRANSLATE_API_KEY=YOUR_GOOGLE_TRANSLATE_API_KEY_HERE',
            `REACT_APP_GOOGLE_TRANSLATE_API_KEY=${apiKey.trim()}`
          );
          
          fs.writeFileSync(envPath, updatedContent);
          console.log('✅ API key configured successfully!\n');
        } else {
          console.log('❌ No API key provided\n');
        }
        
        showNextSteps();
        rl.close();
      });
    } else {
      showNextSteps();
      rl.close();
    }
  });
}

function showNextSteps() {
  console.log('📋 Next Steps:');
  console.log('==============');
  console.log('');
  console.log('1. 🔑 Get Google Cloud Translation API Key:');
  console.log('   - Go to: https://console.cloud.google.com/');
  console.log('   - Enable Cloud Translation API');
  console.log('   - Create API credentials');
  console.log('   - Add key to .env file');
  console.log('');
  console.log('2. 🔥 Configure Firebase Firestore:');
  console.log('   - Ensure Firestore is enabled');
  console.log('   - Update firestore.rules for translation caching');
  console.log('');
  console.log('3. 🚀 Start your development server:');
  console.log('   npm start');
  console.log('');
  console.log('4. 🧪 Test the translation system:');
  console.log('   - Open your app in the browser');
  console.log('   - Try the "Enhanced Translate" feature');
  console.log('   - Test highlight and translate functionality');
  console.log('');
  console.log('📚 For detailed setup instructions, see: TRANSLATION_SETUP_GUIDE.md');
  console.log('');
  console.log('🎉 Your enhanced translation system is ready!');
}

if (hasApiKey) {
  showNextSteps();
  rl.close();
}
