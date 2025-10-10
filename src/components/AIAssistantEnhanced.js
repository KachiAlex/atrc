import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import aiService from '../services/aiService';
import voiceService from '../services/voiceService';
import contentSuggestionService from '../services/contentSuggestionService';
import AIAnalyticsInsights from './AIAnalyticsInsights';
import toast from 'react-hot-toast';

const AIAssistantEnhanced = () => {
  const { isDarkMode } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Voice features
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // AI Analytics
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Content suggestions
  const [contentSuggestions, setContentSuggestions] = useState([]);
  const [showContentSuggestions, setShowContentSuggestions] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get current context for AI
  const getContext = () => ({
    currentPage: location.pathname,
    userRole: userProfile?.role || 'member',
    userName: userProfile?.displayName || currentUser?.email?.split('@')[0] || 'User'
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+K or Cmd+K to toggle assistant
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      
      // Ctrl+Shift+V or Cmd+Shift+V to toggle voice
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        handleVoiceInput();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  // Track page views for content suggestions
  useEffect(() => {
    contentSuggestionService.trackActivity({
      type: 'pageView',
      page: location.pathname,
      timestamp: new Date()
    });
  }, [location.pathname]);

  // Load suggested questions when component mounts or context changes
  useEffect(() => {
    const context = getContext();
    const suggestions = aiService.getSuggestedQuestions(context);
    setSuggestedQuestions(suggestions);
    
    // Load content suggestions
    loadContentSuggestions(context);
  }, [location.pathname, userProfile?.role]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Hello ${getContext().userName}! 👋

I'm ATRC Assistant, your intelligent guide with voice capabilities!

**New Features:**
🎤 Voice Input - Click mic button or press Ctrl+Shift+V
🔊 Voice Output - I can speak my responses
💡 Smart Suggestions - Personalized content recommendations
📊 AI Insights - Advanced analytics and predictions

How can I assist you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Speak welcome if voice enabled
      if (voiceEnabled && voiceService.isSynthesisSupported()) {
        voiceService.speak(welcomeMessage.content, { rate: 1.1 });
      }
    }
  }, [isOpen]);

  const loadContentSuggestions = async (context) => {
    try {
      const suggestions = await contentSuggestionService.getSuggestions(context);
      setContentSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading content suggestions:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Track activity
    contentSuggestionService.trackActivity({
      type: 'action',
      action: 'sendMessage',
      content: inputMessage,
      timestamp: new Date()
    });

    try {
      const context = getContext();
      const aiResponse = await aiService.sendMessage(inputMessage, context);

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak response if voice enabled
      if (voiceEnabled && voiceService.isSynthesisSupported()) {
        voiceService.speak(aiResponse, { rate: 1.1 });
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (!voiceService.isRecognitionSupported()) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    toast.success('Listening... Speak now');

    voiceService.startListening(
      (result) => {
        // Update input with interim results
        if (result.interim) {
          setInputMessage(result.interim);
        }
        
        // Send final result
        if (result.isFinal) {
          setInputMessage(result.final);
          setIsListening(false);
          // Auto-send after voice input
          setTimeout(() => {
            if (result.final) {
              handleSendMessage();
            }
          }, 500);
        }
      },
      (error) => {
        console.error('Voice input error:', error);
        setIsListening(false);
        toast.error('Voice input failed');
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const toggleVoiceOutput = () => {
    setVoiceEnabled(prev => !prev);
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }
    toast.success(voiceEnabled ? 'Voice output disabled' : 'Voice output enabled');
  };

  const handleSuggestedQuestion = async (question) => {
    setInputMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleContentSuggestion = (suggestion) => {
    if (suggestion.link) {
      window.location.href = suggestion.link;
    } else if (suggestion.action) {
      toast.info(`Action: ${suggestion.action}`);
    }
    setShowContentSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    if (window.confirm('Clear conversation history?')) {
      aiService.clearHistory();
      setMessages([]);
      setShowSuggestions(true);
      voiceService.stopSpeaking();
      toast.success('Conversation cleared');
      
      setTimeout(() => {
        const welcomeMessage = {
          role: 'assistant',
          content: `Conversation cleared! How can I help you now?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }, 100);
    }
  };

  const providerInfo = aiService.getProviderInfo();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all transform hover:scale-110 ${
          isDarkMode 
            ? 'bg-primary-600 hover:bg-primary-700' 
            : 'bg-primary-500 hover:bg-primary-600'
        } text-white`}
        aria-label="Open AI Assistant"
        title="Open AI Assistant (Ctrl+K)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </button>
    );
  }

  return (
    <>
      <div 
        className={`fixed z-50 transition-all ${
          isMinimized 
            ? 'bottom-6 right-6 w-80' 
            : 'bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)]'
        } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        style={{ height: isMinimized ? 'auto' : '650px', maxHeight: 'calc(100vh - 3rem)' }}
      >
        <div className={`h-full flex flex-col rounded-lg shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${
            isDarkMode ? 'bg-gradient-to-r from-primary-600 to-primary-700' : 'bg-gradient-to-r from-primary-500 to-primary-600'
          } text-white`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
              </div>
              <div>
                <h3 className="font-semibold flex items-center space-x-2">
                  <span>ATRC Assistant</span>
                  {voiceEnabled && <span className="text-xs">🎤</span>}
                </h3>
                <p className="text-xs text-white/80">{providerInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowContentSuggestions(!showContentSuggestions)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Content Suggestions"
              >
                <span className="text-lg">💡</span>
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="AI Analytics"
              >
                <span className="text-lg">📊</span>
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Minimize"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Close (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Content Suggestions Panel */}
              {showContentSuggestions && contentSuggestions.length > 0 && (
                <div className={`border-b ${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      💡 Suggested for You
                    </h4>
                    <button
                      onClick={() => setShowContentSuggestions(false)}
                      className={`text-xs ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {contentSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleContentSuggestion(suggestion)}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-white hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-base">{suggestion.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{suggestion.title}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {suggestion.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? isDarkMode
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-500 text-white'
                          : message.isError
                          ? 'bg-red-100 text-red-800'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' 
                          ? 'text-white/70' 
                          : isDarkMode 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`rounded-lg px-4 py-3 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {showSuggestions && suggestedQuestions.length > 0 && messages.length <= 1 && (
                  <div className="space-y-2">
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Suggested questions:
                    </p>
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className={`px-4 py-2 border-t ${
                isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={clearConversation}
                      className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                      title="Clear conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={toggleVoiceOutput}
                      className={`px-2 py-1 rounded transition-colors ${
                        voiceEnabled
                          ? 'bg-green-100 text-green-800'
                          : isDarkMode 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                      title={voiceEnabled ? 'Voice output ON' : 'Voice output OFF'}
                    >
                      {voiceEnabled ? '🔊' : '🔇'}
                    </button>
                  </div>
                  <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {providerInfo.status === 'limited' ? '⚠️ ' : '✓ '}{providerInfo.description}
                  </span>
                </div>
              </div>

              {/* Input Area */}
              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex space-x-2">
                  <button
                    onClick={handleVoiceInput}
                    disabled={isTyping}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Voice input (Ctrl+Shift+V)"
                  >
                    {isListening ? '⏸️' : '🎤'}
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    disabled={isTyping || isListening}
                    className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${(isTyping || isListening) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping || isListening}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !inputMessage.trim() || isTyping || isListening
                        ? isDarkMode
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <kbd className="px-1 rounded border">Ctrl+K</kbd> Open • <kbd className="px-1 rounded border">Enter</kbd> Send • <kbd className="px-1 rounded border">Ctrl+Shift+V</kbd> Voice
                </p>
              </div>
            </>
          )}

          {isMinimized && (
            <div className="p-4 text-center">
              <button
                onClick={() => setIsMinimized(false)}
                className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Click to expand assistant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Analytics Modal */}
      <AIAnalyticsInsights 
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </>
  );
};

export default AIAssistantEnhanced;

