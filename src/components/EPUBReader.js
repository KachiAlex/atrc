import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const EPUBReader = ({ bookUrl, bookTitle, onClose }) => {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const [location, setLocation] = useState(null);
  const [selections, setSelections] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [showTranslationPanel, setShowTranslationPanel] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [corsError, setCorsError] = useState(false);

  // Helper function to handle CORS issues
  const getEpubUrl = (url) => {
    // Validate URL first
    try {
      new URL(url);
    } catch (error) {
      console.error('Invalid URL provided:', url);
      setCorsError(true);
      return null;
    }

    // For Firebase Storage URLs, check if CORS is configured
    if (url.includes('firebasestorage.googleapis.com')) {
      // Since CORS is now configured, try direct access first
      return url;
    }
    return url;
  };

  // Use the validated URL
  const epubUrl = getEpubUrl(bookUrl);
  
  // If URL is invalid, show error
  if (!epubUrl) {
    return (
      <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Invalid Book URL
          </h3>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The book file URL is not valid. Please contact an administrator.
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'sw', name: 'Swahili' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' },
    { code: 'zu', name: 'Zulu' },
    { code: 'am', name: 'Amharic' },
    { code: 'om', name: 'Oromo' }
  ];

  // Simple translation function (can be enhanced with Google Translate API)
  const translateText = async (text, targetLang) => {
    // For now, we'll use a simple mapping for common terms
    // In production, this would connect to Google Translate API
    const commonTranslations = {
      'en': {
        'fr': {
          'Leadership': 'Leadership',
          'Traditional': 'Traditionnel',
          'Ruler': 'Dirigeant',
          'Wisdom': 'Sagesse',
          'Community': 'Communauté',
          'Chapter': 'Chapitre',
          'Introduction': 'Introduction',
          'Conclusion': 'Conclusion'
        },
        'sw': {
          'Leadership': 'Uongozi',
          'Traditional': 'Jadi',
          'Ruler': 'Mtawala',
          'Wisdom': 'Hekima',
          'Community': 'Jamii',
          'Chapter': 'Sura',
          'Introduction': 'Utangulizi',
          'Conclusion': 'Hitimisho'
        },
        'yo': {
          'Leadership': 'Asiwaju',
          'Traditional': 'Aṣa',
          'Ruler': 'Ọba',
          'Wisdom': 'Ọgbọn',
          'Community': 'Agbegbe',
          'Chapter': 'Ori',
          'Introduction': 'Ifihan',
          'Conclusion': 'Ipari'
        },
        'ig': {
          'Leadership': 'Nduzi',
          'Traditional': 'Omenala',
          'Ruler': 'Eze',
          'Wisdom': 'Amamihe',
          'Community': 'Obodo',
          'Chapter': 'Isi',
          'Introduction': 'Mmalite',
          'Conclusion': 'Njedebe'
        },
        'ha': {
          'Leadership': 'Jagoranci',
          'Traditional': 'Al\'ada',
          'Ruler': 'Sarki',
          'Wisdom': 'Hikima',
          'Community': 'Al\'umma',
          'Chapter': 'Babi',
          'Introduction': 'Gabatarwa',
          'Conclusion': 'Kammala'
        }
      }
    };

    // Simple word-by-word translation for demonstration
    let translatedText = text;
    const translations = commonTranslations['en'][targetLang];
    
    if (translations) {
      Object.keys(translations).forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translations[word]);
      });
    }

    return translatedText;
  };

  const handleTextSelection = (cfiRange, contents) => {
    if (contents) {
      setSelections([...selections, { cfiRange, contents }]);
      console.log('Text selected:', contents);
    }
  };

  const translateSelectedText = async () => {
    if (selections.length === 0) {
      toast.error('Please select some text first');
      return;
    }

    setIsTranslating(true);
    try {
      const lastSelection = selections[selections.length - 1];
      const translated = await translateText(lastSelection.contents, targetLanguage);
      
      setTranslatedContent({
        original: lastSelection.contents,
        translated: translated,
        targetLanguage: targetLanguage
      });
      
      setShowTranslationPanel(true);
      toast.success('Text translated successfully!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const readerTheme = isDarkMode ? {
    body: {
      background: '#1f2937',
      color: '#f9fafb'
    },
    link: {
      color: '#60a5fa'
    }
  } : {
    body: {
      background: '#ffffff',
      color: '#111827'
    },
    link: {
      color: '#2563eb'
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-b`}>
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Library</span>
            </button>
            
            <div className="flex-1 mx-4 min-w-0 text-center">
              <h1 className={`text-lg font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {bookTitle}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                EPUB Reader - Translation Enabled
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Translation Panel Toggle */}
              <button
                onClick={() => setShowTranslationPanel(!showTranslationPanel)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showTranslationPanel
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Translate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Reader */}
        <div className={`flex-1 ${showTranslationPanel ? 'mr-80' : ''} transition-all duration-300`}>
          {corsError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  CORS Access Issue
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Firebase Storage CORS policy is preventing EPUB file access. This is a temporary limitation.
                </p>
                <div className="space-y-3">
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <strong>Temporary Solutions:</strong>
                  </p>
                  <div className={`text-left text-xs space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>• Upload books in PDF format for immediate reading</p>
                    <p>• EPUB translation features will be available after CORS configuration</p>
                    <p>• Contact admin to configure Firebase Storage CORS settings</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Library
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ReactReader
            url={epubUrl}
            location={location}
            locationChanged={(epubcfi) => setLocation(epubcfi)}
            getRendition={(rendition) => {
              // Apply theme
              rendition.themes.default(readerTheme);
              
              // Enable text selection for translation
              rendition.on('selected', handleTextSelection);
              
              // Disable context menu
              rendition.on('rendered', () => {
                const iframe = rendition.getContents();
                if (iframe) {
                  iframe.document.addEventListener('contextmenu', (e) => e.preventDefault());
                }
              });
              
              // Handle CORS and other errors gracefully
              rendition.on('error', (error) => {
                console.error('EPUB loading error:', error);
                if (error.message && (error.message.includes('CORS') || error.message.includes('Invalid URL'))) {
                  toast.error('EPUB file access issue. CORS configuration may be needed.');
                  setCorsError(true);
                }
              });
            }}
            epubOptions={{
              flow: 'paginated',
              manager: 'default',
              requestMethod: 'GET',
              requestCredentials: 'omit'
            }}
            loadingView={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading EPUB book...</p>
                </div>
              </div>
            }
          />
          )}
        </div>

        {/* Translation Panel */}
        {showTranslationPanel && (
          <div className={`w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-l p-4 overflow-y-auto`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Translation Panel
            </h3>

            {/* Language Selection */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Translate to:
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Instructions */}
            <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                <strong>How to translate:</strong>
              </p>
              <ol className={`text-xs mt-2 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-blue-700'}`}>
                <li>1. Select text in the book</li>
                <li>2. Choose target language</li>
                <li>3. Click "Translate Selected"</li>
              </ol>
            </div>

            {/* Translate Button */}
            <button
              onClick={translateSelectedText}
              disabled={isTranslating || selections.length === 0}
              className={`w-full mb-4 px-4 py-2 rounded-lg transition-colors ${
                isTranslating || selections.length === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isTranslating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Translating...
                </>
              ) : (
                `Translate Selected (${selections.length})`
              )}
            </button>

            {/* Translation Results */}
            {translatedContent && (
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Translation Result
                </h4>
                
                <div className="mb-3">
                  <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Original:
                  </p>
                  <p className={`text-sm p-2 rounded ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {translatedContent.original}
                  </p>
                </div>
                
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {languages.find(l => l.code === translatedContent.targetLanguage)?.name}:
                  </p>
                  <p className={`text-sm p-2 rounded ${isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-800'}`}>
                    {translatedContent.translated}
                  </p>
                </div>

                <button
                  onClick={() => setTranslatedContent(null)}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Translation
                </button>
              </div>
            )}

            {/* Selection History */}
            {selections.length > 0 && (
              <div className="mt-4">
                <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Selections
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selections.slice(-5).map((selection, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {selection.contents.substring(0, 100)}
                      {selection.contents.length > 100 && '...'}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setSelections([])}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  Clear Selections
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Watermark */}
      <div className="absolute bottom-4 right-4 pointer-events-none z-50">
        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
          isDarkMode ? 'bg-gray-900 bg-opacity-70 text-gray-300' : 'bg-white bg-opacity-70 text-gray-600'
        }`}>
          ATRC Digital Library - Translation Enabled
        </div>
      </div>
    </div>
  );
};

export default EPUBReader;
