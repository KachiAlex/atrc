import { api } from '../api/client';

/**
 * AI Assistant Service
 * Routes through the self-hosted backend (/api/ai/chat → Groq) so no
 * provider keys ship in the browser bundle. Falls back to built-in
 * guidance when the backend is unreachable.
 */

// System prompt lives server-side now (see /api/ai/chat in server/index.js).

class AIService {
  constructor() {
    this.conversationHistory = [];
    this.maxHistoryLength = 20; // Keep last 20 messages
    this.provider = 'backend'; // /api/ai/chat
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
   * Send message via the backend AI proxy
   */
  async sendMessageBackend(message, context = {}) {
    const res = await api('/ai/chat', {
      method: 'POST',
      body: {
        message,
        context,
        history: this.conversationHistory
      }
    });
    const aiResponse = res.reply;
    this.addToHistory('user', message);
    this.addToHistory('assistant', aiResponse);
    return aiResponse;
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

To enable full AI capabilities, the backend needs a configured AI provider (contact an administrator).

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
      return await this.sendMessageBackend(message, context);
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
    return {
      name: 'ATRC Assistant',
      description: 'Powered by Groq via the ATRC backend',
      status: 'active'
    };
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;

