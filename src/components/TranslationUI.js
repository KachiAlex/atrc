import React, { useState, useEffect, useRef } from 'react';
import { 
  LanguageIcon, 
  ArrowPathIcon, 
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { translateText, batchTranslateTexts } from '../services/enhancedTranslationService';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

/**
 * Enhanced Translation UI Component
 * Implements ChatGPT's Step 4 recommendations for better UX
 */
const TranslationUI = ({ 
  content, 
  onTranslationComplete, 
  showSideBySide = true,
  enableHighlight = true,
  enableAudio = false,
  className = ""
}) => {
  const { availableLanguages } = useLanguage();
  const [selectedText, setSelectedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationMode, setTranslationMode] = useState('highlight'); // 'highlight', 'full', 'side-by-side'
  const [translationHistory, setTranslationHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const contentRef = useRef(null);
  const translationRef = useRef(null);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && selectedText.length > 0) {
        setSelectedText(selectedText);
        if (enableHighlight) {
          setTranslationMode('highlight');
        }
      } else {
        setSelectedText('');
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('mouseup', handleSelection);
      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener('mouseup', handleSelection);
        }
      };
    }
  }, [enableHighlight]);

  // Translate selected text
  const translateSelectedText = async () => {
    if (!selectedText) return;

    setIsTranslating(true);
    try {
      const result = await translateText(selectedText, targetLanguage);
      setTranslatedText(result);
      setShowTranslation(true);
      
      // Add to history
      setTranslationHistory(prev => [{
        id: Date.now(),
        original: selectedText,
        translated: result,
        language: targetLanguage,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 translations
      
      toast.success('Translation completed!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Translate full content
  const translateFullContent = async () => {
    if (!content) return;

    setIsTranslating(true);
    try {
      const result = await translateText(content, targetLanguage);
      setTranslatedText(result);
      setShowTranslation(true);
      setTranslationMode('full');
      
      if (onTranslationComplete) {
        onTranslationComplete({
          original: content,
          translated: result,
          language: targetLanguage
        });
      }
      
      toast.success('Full content translated!');
    } catch (error) {
      console.error('Full translation error:', error);
      toast.error('Full translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  // Text-to-speech (if supported)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(targetLanguage);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  // Get proper language code for speech synthesis
  const getLanguageCode = (langCode) => {
    const languageMap = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'sw': 'sw-KE',
      'yo': 'yo-NG',
      'ig': 'ig-NG',
      'ha': 'ha-NG',
      'ar': 'ar-SA',
      'zu': 'zu-ZA',
      'xh': 'xh-ZA'
    };
    return languageMap[langCode] || 'en-US';
  };

  // Clear selection
  const clearSelection = () => {
    window.getSelection().removeAllRanges();
    setSelectedText('');
    setShowTranslation(false);
  };

  return (
    <div className={`translation-ui ${className}`}>
      {/* Translation Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <LanguageIcon className="w-5 h-5 text-gray-500" />
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Translation Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setTranslationMode('highlight')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                translationMode === 'highlight'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Highlight
            </button>
            <button
              onClick={() => setTranslationMode('full')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                translationMode === 'full'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Full Text
            </button>
            <button
              onClick={() => setTranslationMode('side-by-side')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                translationMode === 'side-by-side'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedText && translationMode === 'highlight' && (
              <button
                onClick={translateSelectedText}
                disabled={isTranslating}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isTranslating ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <LanguageIcon className="w-4 h-4" />
                )}
                Translate Selected
              </button>
            )}

            {translationMode === 'full' && (
              <button
                onClick={translateFullContent}
                disabled={isTranslating}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isTranslating ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <LanguageIcon className="w-4 h-4" />
                )}
                Translate All
              </button>
            )}

            {showTranslation && (
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
              >
                {showTranslation ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
                {showTranslation ? 'Hide' : 'Show'} Translation
              </button>
            )}
          </div>
        </div>

        {/* Selected Text Display */}
        {selectedText && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected text:</p>
                <p className="text-gray-900 dark:text-white font-medium">"{selectedText}"</p>
              </div>
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Display */}
      <div className={`content-container ${showSideBySide ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
        {/* Original Content */}
        <div className="content-section">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Original Text</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(content)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Copy original text"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
              </button>
              {enableAudio && (
                <button
                  onClick={() => speakText(content)}
                  className={`p-2 ${isPlaying ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  title="Read aloud"
                >
                  <SpeakerWaveIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div
            ref={contentRef}
            className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Translated Content */}
        {showTranslation && (
          <div className="content-section">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Translation ({availableLanguages.find(l => l.code === targetLanguage)?.name || targetLanguage})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(translatedText)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  title="Copy translation"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
                {enableAudio && (
                  <button
                    onClick={() => speakText(translatedText)}
                    className={`p-2 ${isPlaying ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    title="Read translation aloud"
                  >
                    <SpeakerWaveIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div
              ref={translationRef}
              className="prose dark:prose-invert max-w-none p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 min-h-[200px]"
            >
              {isTranslating ? (
                <div className="flex items-center justify-center py-8">
                  <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">Translating...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Translation History */}
      {translationHistory.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Translations</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {translationHistory.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    "{item.original}"
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    "{item.translated}"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.language} • {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => copyToClipboard(item.translated)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy translation"
                  >
                    <ClipboardDocumentIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationUI;
