import axios from 'axios';

/**
 * AI Assistant Service
 * Provides intelligent assistance using multiple AI providers
 * Supports: OpenAI GPT-4, Anthropic Claude, Google Gemini
 */

// API Configuration
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are ATRC Assistant, an intelligent AI helper for the African Traditional Rulers Council (ATRC) digital platform. You help traditional rulers, chiefs, elders, and community members navigate the platform and accomplish their tasks.

PLATFORM FEATURES:
1. **Dashboard**: Overview of activities, quick stats, recent updates
2. **Community Management**: Create/manage communities, view members, generate reports
3. **Dispute Resolution**: File disputes, upload evidence, track resolution status
4. **Event Management**: Create/manage cultural events and ceremonies
5. **Announcements**: View and create announcements (admin only)
6. **Reports & Analytics**: View statistics, charts, download reports
7. **Educational Platform**: Access books (PDF, DOCX, EPUB) and video courses with translation
8. **Live Meetings**: Join virtual meetings and conferences
9. **Profile & Settings**: Manage user profile and preferences
10. **Translation**: Content available in 100+ languages including Yoruba, Igbo, Hausa, Swahili

USER ROLES:
- **Admin**: Full system access, user management
- **Traditional Ruler**: Community leadership, dispute resolution
- **Chief**: Community management, event organization
- **Elder**: Dispute mediation, cultural guidance
- **Community Member**: Basic access to community features

YOUR CAPABILITIES:
- Guide users through platform navigation
- Explain features and how to use them
- Provide step-by-step instructions
- Answer questions about traditional governance
- Offer cultural insights respectfully
- Suggest relevant features based on user needs
- Help troubleshoot common issues

COMMUNICATION STYLE:
- Be respectful, warm, and professional
- Use clear, simple language
- Acknowledge traditional titles and cultural context
- Provide concise but comprehensive answers
- Offer specific action steps when appropriate
- Be encouraging and supportive

When users ask for help:
1. Understand their current context (which page they're on)
2. Provide relevant, actionable guidance
3. Offer to help with next steps
4. Suggest related features they might find useful`;

class AIService {
  constructor() {
    this.conversationHistory = [];
    this.maxHistoryLength = 20; // Keep last 20 messages
    this.provider = this.selectProvider();
  }

  selectProvider() {
    // Priority: OpenAI > Anthropic > Gemini > Fallback
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
      return 'openai';
    } else if (ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'YOUR_ANTHROPIC_API_KEY_HERE') {
      return 'anthropic';
    } else if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      return 'gemini';
    }
    return 'fallback';
  }

  /**
   * Add message to conversation history
   */
  addToHistory(role, content) {
    this.conversationHistory.push({ role, content });
    
    // Keep only recent messages to avoid token limits
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get context-aware system prompt
   */
  getContextualPrompt(context) {
    let contextPrompt = SYSTEM_PROMPT;

    if (context.currentPage) {
      contextPrompt += `\n\nCURRENT CONTEXT:\nThe user is currently on the "${context.currentPage}" page.`;
    }

    if (context.userRole) {
      contextPrompt += `\nUser Role: ${context.userRole}`;
    }

    if (context.userName) {
      contextPrompt += `\nUser Name: ${context.userName}`;
    }

    return contextPrompt;
  }

  /**
   * Send message using OpenAI GPT-4
   */
  async sendMessageOpenAI(message, context = {}) {
    try {
      const messages = [
        { role: 'system', content: this.getContextualPrompt(context) },
        ...this.conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini', // Fast, cost-effective ($0.15/1M input tokens)
          messages,
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Update conversation history
      this.addToHistory('user', message);
      this.addToHistory('assistant', aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response from OpenAI');
    }
  }

  /**
   * Send message using Anthropic Claude
   */
  async sendMessageAnthropic(message, context = {}) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          system: this.getContextualPrompt(context),
          messages: [
            ...this.conversationHistory.map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            })),
            { role: 'user', content: message }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      const aiResponse = response.data.content[0].text;
      
      // Update conversation history
      this.addToHistory('user', message);
      this.addToHistory('assistant', aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error('Failed to get AI response from Anthropic');
    }
  }

  /**
   * Send message using Google Gemini
   */
  async sendMessageGemini(message, context = {}) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: this.getContextualPrompt(context) + '\n\n' + message }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Update conversation history
      this.addToHistory('user', message);
      this.addToHistory('assistant', aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get AI response from Gemini');
    }
  }

  /**
   * Fallback response when no AI provider is available
   */
  getFallbackResponse(message, context = {}) {
    const lowerMessage = message.toLowerCase();

    // Pattern matching for common questions
    const responses = {
      'hello|hi|hey|greetings': `Hello! I'm ATRC Assistant. I'm here to help you navigate the African Traditional Rulers Council platform. How can I assist you today?`,
      
      'community|communities': `To manage communities, go to the "Community" section from the sidebar. There you can:
• Create new communities
• View and edit existing communities
• Manage community members
• Generate community reports

Would you like specific guidance on any of these tasks?`,
      
      'dispute|resolution': `The Dispute Resolution system helps handle traditional disputes. You can:
• File new disputes
• Upload evidence (documents, images, videos)
• Track dispute status (Pending, In Progress, Resolved)
• View dispute history

Navigate to "Disputes" from the sidebar to get started. Need help filing a dispute?`,
      
      'event|ceremony': `To manage cultural events and ceremonies:
• Go to "Events" in the sidebar
• Click "Create Event" to add new ceremonies
• Set date, time, location, and visibility
• Invite community members

Traditional rulers and chiefs can create events. Would you like more details?`,
      
      'report|analytics|statistics': `The Reports & Analytics section provides comprehensive insights:
• Overview dashboard with key metrics
• Dispute analytics with charts
• Community statistics
• Downloadable reports (JSON format)

Visit "Reports" in the sidebar to view all analytics. What specific data are you looking for?`,
      
      'book|course|education|learning': `Our Educational Platform offers:
• Books in PDF, DOCX, and EPUB formats
• Video courses on leadership and governance
• Translation to 100+ languages
• Bookmark and progress tracking

Access "Books" or "Courses" from the sidebar. What would you like to learn about?`,
      
      'translate|translation|language': `Translation features:
• Available in 100+ languages
• African languages: Yoruba, Igbo, Hausa, Swahili
• Translate books and documents
• Real-time translation powered by Google

Use the language selector or translation button in book readers. Which language would you prefer?`,
      
      'help|how': `I'm here to help! You can ask me about:
• How to use specific features
• Navigating the platform
• Your user role and permissions
• Traditional governance questions
• Troubleshooting issues

What specific help do you need?`,
      
      'profile|settings': `To manage your profile and settings:
• Click on your profile icon in the top right
• Update personal information
• Change display preferences
• Set notification preferences
• Manage traditional titles

What would you like to update?`
    };

    // Find matching response
    for (const [pattern, response] of Object.entries(responses)) {
      if (new RegExp(pattern, 'i').test(lowerMessage)) {
        return response;
      }
    }

    // Default response
    return `Thank you for your question. I'm currently operating in basic mode. Here are some things I can help you with:

**Platform Navigation:**
• Dashboard - View overview and quick stats
• Community Management - Manage traditional communities
• Dispute Resolution - Handle traditional disputes
• Events - Organize cultural ceremonies
• Reports & Analytics - View insights and statistics
• Educational Platform - Access books and courses

**Current Page:** ${context.currentPage || 'Dashboard'}
**Your Role:** ${context.userRole || 'User'}

To enable full AI capabilities, configure an AI API key (OpenAI, Anthropic, or Gemini) in your environment settings.

What specific feature would you like to learn about?`;
  }

  /**
   * Main method to send message to AI
   */
  async sendMessage(message, context = {}) {
    if (!message || !message.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      switch (this.provider) {
        case 'openai':
          return await this.sendMessageOpenAI(message, context);
        
        case 'anthropic':
          return await this.sendMessageAnthropic(message, context);
        
        case 'gemini':
          return await this.sendMessageGemini(message, context);
        
        case 'fallback':
        default:
          // Add to history for fallback too
          this.addToHistory('user', message);
          const fallbackResponse = this.getFallbackResponse(message, context);
          this.addToHistory('assistant', fallbackResponse);
          return fallbackResponse;
      }
    } catch (error) {
      console.error('AI Service error:', error);
      
      // Fallback to pattern matching if API fails
      this.addToHistory('user', message);
      const fallbackResponse = this.getFallbackResponse(message, context);
      this.addToHistory('assistant', fallbackResponse);
      return fallbackResponse;
    }
  }

  /**
   * Get suggested questions based on context
   */
  getSuggestedQuestions(context = {}) {
    const baseQuestions = [
      'How do I create a new community?',
      'How do I file a dispute?',
      'How can I view analytics?',
      'How do I access educational content?'
    ];

    const roleSpecificQuestions = {
      admin: [
        'How do I manage user permissions?',
        'How do I create announcements?',
        'How do I generate system-wide reports?'
      ],
      ruler: [
        'How do I resolve disputes in my community?',
        'How do I view my community members?',
        'How do I organize cultural events?'
      ],
      chief: [
        'How do I manage my community?',
        'How do I create events?',
        'How do I view community reports?'
      ],
      elder: [
        'How do I mediate disputes?',
        'How do I access traditional wisdom resources?',
        'How do I mentor community members?'
      ]
    };

    const pageSpecificQuestions = {
      '/app/community': [
        'How do I add a new community?',
        'How do I view community members?',
        'How do I generate a community report?'
      ],
      '/app/disputes': [
        'How do I file a new dispute?',
        'How do I upload evidence?',
        'How do I update dispute status?'
      ],
      '/app/events': [
        'How do I create an event?',
        'How do I set event visibility?',
        'How do I invite attendees?'
      ],
      '/app/reports': [
        'How do I download reports?',
        'How do I interpret the analytics?',
        'What metrics are tracked?'
      ],
      '/app/books': [
        'How do I read a book?',
        'How do I translate content?',
        'How do I bookmark pages?'
      ],
      '/app/courses': [
        'How do I enroll in a course?',
        'How do I track my progress?',
        'How do I get a certificate?'
      ]
    };

    let suggestions = [...baseQuestions];

    // Add role-specific questions
    if (context.userRole && roleSpecificQuestions[context.userRole]) {
      suggestions = [...roleSpecificQuestions[context.userRole], ...suggestions];
    }

    // Add page-specific questions
    if (context.currentPage && pageSpecificQuestions[context.currentPage]) {
      suggestions = [...pageSpecificQuestions[context.currentPage], ...suggestions];
    }

    // Return unique questions (max 6)
    return [...new Set(suggestions)].slice(0, 6);
  }

  /**
   * Get AI provider info
   */
  getProviderInfo() {
    const providers = {
      openai: {
        name: 'OpenAI GPT-4',
        description: 'Advanced AI with deep reasoning',
        status: 'active'
      },
      anthropic: {
        name: 'Anthropic Claude',
        description: 'Thoughtful and nuanced responses',
        status: 'active'
      },
      gemini: {
        name: 'Google Gemini',
        description: 'Fast and efficient AI',
        status: 'active'
      },
      fallback: {
        name: 'Pattern Matching',
        description: 'Basic assistance (configure AI API for full features)',
        status: 'limited'
      }
    };

    return providers[this.provider] || providers.fallback;
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;

