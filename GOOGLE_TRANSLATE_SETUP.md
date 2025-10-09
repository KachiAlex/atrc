# Google Cloud Translation API Integration Guide

## Overview
Your Traditional Rulers App now supports real-time translation using Google Cloud Translation API with automatic fallback to static translations.

---

## 📋 Step-by-Step Setup

### **Step 1: Create/Configure Google Cloud Project**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select Your Project**
   - Use your existing Firebase project: `atrc-3326f`
   - OR create a new project (if you prefer separate billing)

### **Step 2: Enable Cloud Translation API**

1. **Navigate to APIs & Services**
   - In the left sidebar, click: `APIs & Services` → `Library`

2. **Search and Enable**
   - Search for: "Cloud Translation API"
   - Click on "Cloud Translation API"
   - Click the "**ENABLE**" button

### **Step 3: Create API Credentials**

1. **Go to Credentials**
   - Click: `APIs & Services` → `Credentials`

2. **Create API Key**
   - Click "**+ CREATE CREDENTIALS**" at the top
   - Select "**API Key**"
   - Copy the generated API key immediately

3. **Restrict API Key (Recommended for Security)**
   - Click "**RESTRICT KEY**" in the popup
   - Under "Application restrictions":
     - Select "**HTTP referrers (websites)**"
     - Add your website URLs:
       ```
       http://localhost:3000/*
       https://atrc-3326f.web.app/*
       https://atrc-3326f.firebaseapp.com/*
       https://your-custom-domain.com/*
       ```
   - Under "API restrictions":
     - Select "**Restrict key**"
     - Check only "**Cloud Translation API**"
   - Click "**SAVE**"

### **Step 4: Add API Key to Your Project**

1. **Open your `.env` file** in the project root
2. **Replace the placeholder** with your actual API key:

```bash
REACT_APP_GOOGLE_TRANSLATE_API_KEY=AIzaSyD_YOUR_ACTUAL_API_KEY_HERE
```

3. **Save the file**

### **Step 5: Restart Your Development Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

---

## 💰 Pricing Information

### **Free Tier**
- ✅ **500,000 characters per month FREE**
- Perfect for moderate usage

### **Paid Tier**
- 💵 **$20 per million characters** after free tier
- Example costs:
  - 1 book translation (~300K chars) = $0.00-$0.01
  - 100 book translations = $0.60-$1.00
  - 1,000 book translations = $6.00-$10.00

### **Cost Monitoring**
- Set up budget alerts in Google Cloud Console
- Monitor usage at: https://console.cloud.google.com/billing

---

## 🔧 How It Works

### **Translation Flow**
1. **Primary**: Google Cloud Translation API (real-time, accurate)
2. **Fallback 1**: Custom translation service (if configured)
3. **Fallback 2**: Static African language translations (offline)

### **Features**
- ✅ Real-time translation using Google's AI
- ✅ Support for 100+ languages
- ✅ Automatic language detection
- ✅ Batch translation for better performance
- ✅ Graceful fallback to offline translations
- ✅ Cost-effective with free tier

---

## 🧪 Testing the Integration

### **Test 1: Translate Text in EPUB Reader**
1. Open any book in the library
2. Select a target language (e.g., French, Spanish, Yoruba)
3. Click "**Translate Book**"
4. Verify the content is translated

### **Test 2: Check Browser Console**
1. Open Developer Tools (F12)
2. Look for translation logs
3. Verify no errors appear

### **Test 3: Without API Key (Fallback)**
1. Set `REACT_APP_GOOGLE_TRANSLATE_API_KEY=YOUR_GOOGLE_TRANSLATE_API_KEY_HERE`
2. Restart server
3. Translation should still work using static dictionaries

---

## 🐛 Troubleshooting

### **Problem: "API key not configured" error**
**Solution:**
- Check `.env` file contains the correct API key
- Ensure no extra spaces or quotes around the key
- Restart development server

### **Problem: "API key not valid" error**
**Solution:**
- Verify the API key is correct in Google Cloud Console
- Ensure Cloud Translation API is enabled
- Check API key restrictions allow your domain

### **Problem: Translation not working**
**Solution:**
- Open browser console (F12) and check for errors
- Verify internet connection
- Check if you've exceeded the free tier limit
- Try the fallback: it should use static translations

### **Problem: CORS errors**
**Solution:**
- Ensure you're using the correct API endpoint
- API key restrictions should use HTTP referrers, not IP addresses
- Add your local development URL to allowed referrers

---

## 📊 Usage Monitoring

### **View Usage Statistics**
1. Go to: https://console.cloud.google.com/apis/api/translate.googleapis.com/metrics
2. View:
   - Total requests
   - Characters translated
   - Error rates
   - Cost estimates

### **Set Up Budget Alerts**
1. Go to: https://console.cloud.google.com/billing/budgets
2. Click "**CREATE BUDGET**"
3. Set your monthly limit (e.g., $5, $10, $20)
4. Configure email alerts at 50%, 90%, 100%

---

## 🔒 Security Best Practices

### **API Key Security**
1. ✅ Never commit `.env` file to Git (already in `.gitignore`)
2. ✅ Use API key restrictions (domains/IPs)
3. ✅ Limit API access to only Translation API
4. ✅ Rotate API keys periodically
5. ✅ Use environment variables for production

### **Production Deployment**
For Firebase Hosting, set environment variables:

```bash
# Not needed for Create React App - set in hosting environment
# Firebase Hosting serves static files, so you'll need to:
# 1. Build with the API key in .env
# 2. Deploy the built files
```

For other hosting (Vercel, Netlify, etc.):
```bash
# Set in hosting dashboard under Environment Variables
REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_key_here
```

---

## 📝 Supported Languages

The integration supports **100+ languages**, including:

### **Major Languages**
- English, French, Spanish, Portuguese, Arabic, Chinese, Japanese, Korean, Russian, German, Italian

### **African Languages**
- Swahili, Yoruba, Igbo, Hausa, Zulu, Amharic, Oromo, Somali, Afrikaans, Shona

### **All Supported Languages**
View complete list: https://cloud.google.com/translate/docs/languages

---

## 🚀 Advanced Features

### **1. Batch Translation**
The service automatically batches multiple translation requests for better performance.

### **2. Language Detection**
Automatically detect the source language of text:
```javascript
import { detectLanguage } from '../services/translationService';
const detectedLang = await detectLanguage("Bonjour le monde");
// Returns: 'fr'
```

### **3. Custom Translation Service**
Configure a fallback translation service (e.g., LibreTranslate):
```bash
REACT_APP_TRANSLATE_API_URL=https://libretranslate.com/translate
REACT_APP_TRANSLATE_API_KEY=your_optional_key
```

---

## 📞 Support & Resources

### **Google Cloud Documentation**
- Translation API Docs: https://cloud.google.com/translate/docs
- Pricing: https://cloud.google.com/translate/pricing
- Supported Languages: https://cloud.google.com/translate/docs/languages

### **Need Help?**
- Check browser console for errors
- Review Google Cloud Console quotas
- Verify API key restrictions
- Test with a fresh API key

---

## ✅ Checklist

- [ ] Google Cloud project created/selected
- [ ] Cloud Translation API enabled
- [ ] API key created
- [ ] API key restricted (security)
- [ ] API key added to `.env` file
- [ ] Development server restarted
- [ ] Translation tested successfully
- [ ] Budget alerts configured
- [ ] Usage monitoring set up

---

## 🎉 Success!

Your app now has professional-grade translation powered by Google's AI! The integration includes:
- ✅ Real-time translation
- ✅ 100+ languages supported
- ✅ Automatic fallback system
- ✅ Cost-effective free tier
- ✅ Enterprise-grade accuracy

Happy translating! 🌍📚

