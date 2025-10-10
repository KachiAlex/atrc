# AI Assistant (GPT) Integration Guide

## Overview
Your ATRC app already has a fully-featured AI Assistant with voice support! It just needs an OpenAI API key to activate GPT intelligence.

---

## ✨ Current Features

Your AI Assistant includes:
- ✅ **Chat Interface** - Fixed floating button (bottom-right)
- ✅ **Voice Input** - Speak your questions (Ctrl+Shift+V)
- ✅ **Voice Output** - AI speaks responses
- ✅ **Context-Aware** - Knows what page you're on and your role
- ✅ **Smart Suggestions** - Personalized recommendations
- ✅ **Multi-Provider Support** - OpenAI, Anthropic, Gemini
- ✅ **Keyboard Shortcuts** - Ctrl+K to open, Esc to close
- ✅ **Conversation History** - Maintains context
- ✅ **Analytics Dashboard** - Usage insights

---

## 🚀 Quick Setup (5 minutes)

### **Step 1: Get Your OpenAI API Key**

1. **Go to OpenAI Platform**
   - Visit: https://platform.openai.com/
   - Sign in or create an account

2. **Create API Key**
   - Click your profile (top-right) → "API keys"
   - Click "**+ Create new secret key**"
   - Name it: "ATRC App"
   - Copy the key immediately (you won't see it again!)

3. **Add Payment Method (Required)**
   - Go to: Settings → Billing
   - Add a payment method
   - Set usage limits (recommended: $10/month for safety)

### **Step 2: Add Key to Your App**

Open your `.env` file and add:

```bash
# AI Assistant Configuration
REACT_APP_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Step 3: Restart Development Server**

```bash
# Stop current server (Ctrl+C)
npm start
```

### **Step 4: Test the AI Assistant**

1. Look for the **blue chat bubble** in the bottom-right corner
2. Click it (or press **Ctrl+K**)
3. Ask: "How do I create a community?"
4. Watch GPT-4o-mini respond intelligently! 🎉

---

## 💰 Pricing Information

### **GPT-4o-mini (Current Model)**
- **Input**: $0.15 per 1 million tokens (~750,000 words)
- **Output**: $0.60 per 1 million tokens

### **Example Costs**
- **100 conversations** (avg 10 messages each) ≈ **$0.05-$0.10**
- **1,000 conversations** ≈ **$0.50-$1.00**
- **10,000 conversations** ≈ **$5.00-$10.00**

### **Free Tier**
OpenAI gives new accounts **$5 free credit** valid for 3 months!

---

## 🔧 Configuration Options

### **Change AI Model**

Edit `src/services/aiService.js` line 132:

```javascript
// Budget-friendly (current)
model: 'gpt-4o-mini'

// More powerful (better reasoning)
model: 'gpt-4o'  // $2.50/1M input, $10/1M output

// Legacy (most powerful)
model: 'gpt-4-turbo'  // $10/1M input, $30/1M output
```

### **Alternative AI Providers**

#### **Anthropic Claude (Alternative)**
```bash
REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxx
```
- Get key: https://console.anthropic.com/
- Model: Claude 3 Sonnet
- Pricing: Similar to GPT-4

#### **Google Gemini (Alternative)**
```bash
REACT_APP_GEMINI_API_KEY=AIzaSy...
```
- Get key: https://makersuite.google.com/
- Model: Gemini Pro
- Free tier available!

---

## 🎯 How It Works

### **Automatic Provider Selection**
The system automatically picks the best available AI:

1. **OpenAI GPT** (if key configured) - Best overall
2. **Anthropic Claude** (if key configured) - Great for nuanced responses
3. **Google Gemini** (if key configured) - Fast and free
4. **Fallback** (no key needed) - Basic pattern matching

### **Context Awareness**
The AI knows:
- ✅ Current page you're on
- ✅ Your user role (Admin, Ruler, Chief, Elder, Member)
- ✅ Your name
- ✅ Previous conversation (last 20 messages)

### **Smart Features**
- **Suggested Questions** - Based on your role and current page
- **Content Recommendations** - Personalized based on activity
- **Voice Commands** - Hands-free interaction
- **AI Analytics** - Usage patterns and insights

---

## 🧪 Testing Scenarios

### **Test 1: General Question**
Ask: "What can you help me with?"
**Expected**: Overview of platform features

### **Test 2: Context-Aware**
- Go to Community page
- Ask: "How do I use this page?"
**Expected**: Specific guide for community management

### **Test 3: Role-Specific**
- As Admin: "What are my responsibilities?"
**Expected**: Admin-specific capabilities

### **Test 4: Voice Input**
- Click microphone button (or Ctrl+Shift+V)
- Speak: "How do I create an event?"
**Expected**: Transcribes speech and responds

### **Test 5: Multi-Turn**
- Ask: "Tell me about disputes"
- Follow-up: "How do I file one?"
**Expected**: Maintains conversation context

---

## 🐛 Troubleshooting

### **Problem: "Basic assistance" mode**
**Cause**: No API key configured
**Solution**: 
1. Check `.env` file has `REACT_APP_OPENAI_API_KEY=sk-...`
2. Restart development server
3. Hard refresh browser (Ctrl+Shift+R)

### **Problem: "Failed to get AI response"**
**Cause**: API key invalid or billing not set up
**Solution**:
1. Verify API key is correct
2. Check OpenAI billing dashboard
3. Ensure you have credits/payment method

### **Problem: Voice not working**
**Cause**: Browser doesn't support Web Speech API
**Solution**:
- Use Chrome, Edge, or Safari
- Grant microphone permissions
- Check browser console for errors

### **Problem: "Rate limit exceeded"**
**Cause**: Too many requests
**Solution**:
- Wait a few minutes
- Set up rate limiting in OpenAI dashboard
- Consider upgrading OpenAI plan

---

## 💡 Usage Tips

### **Keyboard Shortcuts**
- **Ctrl+K** or **Cmd+K** - Open/close assistant
- **Ctrl+Shift+V** - Start voice input
- **Enter** - Send message
- **Shift+Enter** - New line in message
- **Esc** - Close assistant

### **Best Practices**
1. **Be Specific** - "How do I create a community?" vs "How does this work?"
2. **Use Context** - AI knows your current page/role
3. **Multi-Turn** - Build on previous questions
4. **Voice** - Great for hands-free operation
5. **Suggestions** - Click suggested questions for quick help

---

## 🔒 Security Best Practices

### **API Key Security**
1. ✅ Never commit `.env` to Git (already in `.gitignore`)
2. ✅ Use environment variables
3. ✅ Set usage limits in OpenAI dashboard
4. ✅ Monitor API usage regularly
5. ✅ Rotate keys periodically

### **Rate Limiting**
Set limits in OpenAI dashboard:
- **Requests per minute**: 60 (recommended)
- **Tokens per minute**: 40,000 (recommended)
- **Monthly budget**: $10-20 (recommended)

### **Production Deployment**
For Firebase Hosting:
```bash
# Build with environment variables
npm run build

# Deploy (API keys are embedded in build)
firebase deploy
```

For security, consider using a backend proxy:
- Create Firebase Cloud Function
- Store API keys server-side
- Frontend calls function instead of OpenAI directly

---

## 📊 Monitoring Usage

### **OpenAI Dashboard**
Monitor at: https://platform.openai.com/usage

Track:
- Total API calls
- Tokens used (input + output)
- Cost breakdown
- Rate limit usage

### **Set Budget Alerts**
1. Go to: Settings → Limits
2. Set **monthly budget** (e.g., $10)
3. Configure email alerts at 80%, 90%, 100%

---

## 🎨 Customization Options

### **Change Model**
Edit `src/services/aiService.js`:
```javascript
model: 'gpt-4o'  // More powerful, higher cost
```

### **Adjust Temperature**
```javascript
temperature: 0.5  // More focused (0.0-1.0)
temperature: 0.9  // More creative
```

### **Increase Response Length**
```javascript
max_tokens: 2000  // Longer responses
```

### **Modify System Prompt**
Edit SYSTEM_PROMPT in `src/services/aiService.js` to customize:
- Assistant personality
- Capabilities
- Communication style
- Domain knowledge

---

## 🌍 Multi-Language Support

The AI Assistant can respond in any language! Try:
- "Respond in Yoruba"
- "Répondre en français"
- "Jibu kwa Kiswahili"

It works with your Google Translate API for seamless multilingual support.

---

## ✅ Setup Checklist

- [ ] OpenAI account created
- [ ] Payment method added to OpenAI
- [ ] API key generated
- [ ] API key added to `.env` file
- [ ] Development server restarted
- [ ] Browser refreshed
- [ ] AI Assistant tested successfully
- [ ] Usage limits configured
- [ ] Budget alerts set up
- [ ] Monitoring dashboard bookmarked

---

## 🎉 Success Indicators

### **AI is Working When:**
- ✅ Header shows "OpenAI GPT-4" (not "Pattern Matching")
- ✅ Responses are detailed and context-aware
- ✅ Answers questions beyond pre-programmed patterns
- ✅ Maintains conversation context
- ✅ Status shows "✓ Advanced AI with deep reasoning"

### **Still in Fallback Mode When:**
- ⚠️ Header shows "Pattern Matching"
- ⚠️ Status shows "⚠️ Basic assistance"
- ⚠️ Responses are limited to pre-defined patterns

---

## 📚 Example Conversations

### **Navigation Help**
**User**: "How do I access the books?"
**AI**: "To access the Digital Library, click on 'Books' in the sidebar. You'll find books in PDF, DOCX, and EPUB formats with translation support for 100+ languages..."

### **Dispute Resolution**
**User**: "I need to file a dispute"
**AI**: "I'll guide you through filing a dispute:
1. Navigate to 'Disputes' in the sidebar
2. Click 'File New Dispute'
3. Fill in dispute details (parties, description)
4. Upload evidence (documents, images)
5. Submit for review..."

### **Role-Specific**
**User** (as Admin): "What can I do here?"
**AI**: "As an Administrator, you have access to:
- User verification and management
- System-wide announcements
- Full analytics and reports
- Content management (books, courses)
- Event oversight..."

---

## 🆘 Need Help?

### **Resources**
- OpenAI Documentation: https://platform.openai.com/docs
- Pricing: https://openai.com/pricing
- Status: https://status.openai.com/
- Community: https://community.openai.com/

### **Common Issues**
- Check browser console (F12) for errors
- Verify API key format starts with `sk-`
- Ensure billing is active
- Try incognito mode to test
- Check network connectivity

---

## 🎁 Bonus Features

Your AI Assistant already includes:

### **Voice Features** 🎤
- Hands-free question asking
- AI speaks responses aloud
- Multiple voice options
- Adjustable speech rate

### **Analytics Dashboard** 📊
- Usage patterns
- Popular questions
- Response times
- User engagement metrics

### **Smart Suggestions** 💡
- Personalized content recommendations
- Based on your activity
- Role-appropriate suggestions
- Page-specific tips

---

## 🚀 You're All Set!

Your AI Assistant is **production-ready** and includes enterprise features like:
- Multi-provider support
- Graceful fallbacks
- Voice capabilities
- Context awareness
- Security best practices

Just add your OpenAI API key and experience **intelligent assistance** powered by GPT-4o-mini! 🌟

---

**Questions?** Ask the AI Assistant itself: "How do I use you?" 😊
