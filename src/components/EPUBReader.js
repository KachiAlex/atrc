import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { translateWithGoogle, batchTranslate, detectLanguage } from '../services/translationService';

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
  const [isBookTranslated, setIsBookTranslated] = useState(false);
  const [originalLanguage, setOriginalLanguage] = useState('en');
  const [renditionRef, setRenditionRef] = useState(null);


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

  // Enhanced translation function using Google Translate API
  const translateText = async (text, targetLang) => {
    try {
      // Use Google Cloud Translation API (includes fallback logic)
      const translated = await translateWithGoogle(text, targetLang, originalLanguage);
      return translated;
    } catch (error) {
      console.warn('Translation error:', error);
      return text;
    }
  };


  // Helper: walk and translate text nodes inside a given Document (iframe contents)
  const translateDocumentNodes = async (doc) => {
    if (!doc || !doc.body) {
      console.warn('Invalid document provided for translation');
      return;
    }

    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let node;
    
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        nodes.push(node);
      }
    }

    console.log(`Found ${nodes.length} text nodes to translate`);

    // Translate in batches to improve performance
    const batchSize = 10;
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (textNode) => {
          const src = textNode.textContent;
          if (src && src.trim()) {
            try {
              const translated = await translateText(src, targetLanguage);
              if (translated && translated !== src) {
                textNode.textContent = translated;
              }
            } catch (error) {
              console.warn('Translation error for node:', error);
            }
          }
        })
      );
      
      // Update progress
      const progress = Math.round(((i + batch.length) / nodes.length) * 100);
      toast.loading(`Translating... ${progress}%`, { id: 'epub-translation-progress' });
    }
  };

  // Apply translation to all currently rendered contents (iframes)
  const applyTranslationToRendition = async () => {
    if (!renditionRef) {
      console.error('No rendition reference available');
      return;
    }

    try {
      // Access the views from the rendition manager
      const views = renditionRef.views();
      
      if (!views || !views._views || views._views.length === 0) {
        console.warn('No views available in rendition');
        return;
      }

      console.log(`Translating ${views._views.length} views`);

      for (let i = 0; i < views._views.length; i++) {
        const view = views._views[i];
        
        if (view && view.document) {
          console.log(`Translating view ${i + 1}/${views._views.length}`);
          await translateDocumentNodes(view.document);
        }
      }

      toast.dismiss('epub-translation-progress');
      console.log('Translation completed successfully');
      
    } catch (error) {
      console.error('Error accessing rendition views:', error);
      toast.dismiss('epub-translation-progress');
      throw error;
    }
  };

  // Translate entire book function - apply to rendered iframes and hook future renders
  const translateEntireBook = async () => {
    if (!renditionRef || !targetLanguage || targetLanguage === originalLanguage) {
      toast.error('Please select a different target language');
      return;
    }

    setIsTranslating(true);
    let translatingToastId;
    try {
      translatingToastId = toast.loading('Translating book... This may take a moment.');
      
      // Translate current view
      await applyTranslationToRendition();

      setIsBookTranslated(true);
      
      // Set up listener for future page renders
      if (renditionRef) {
        renditionRef.off('rendered'); // Remove any existing listeners
        renditionRef.on('rendered', async (section, view) => {
          if (view && view.document) {
            console.log('Translating new page:', section.href);
            try {
              await translateDocumentNodes(view.document);
            } catch (err) {
              console.warn('Error translating new page:', err);
            }
          }
        });
      }
      if (translatingToastId) toast.dismiss(translatingToastId);
      toast.success(`Book translated to ${languages.find(l => l.code === targetLanguage)?.name}!`);
      
    } catch (error) {
      console.error('Full book translation error:', error);
      if (translatingToastId) toast.dismiss(translatingToastId);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Reset to original language
  const resetToOriginal = async () => {
    if (renditionRef) {
      try {
        // Remove translation listener
        renditionRef.off('rendered');
        
        // Force reload the current location to get original content
        const currentLocation = location;
        setIsBookTranslated(false);
        
        // Reload the page to show original content
        await renditionRef.display(currentLocation);
        
        toast.success('Book reset to original language');
      } catch (error) {
        console.error('Reset error:', error);
        toast.error('Failed to reset book');
      }
    }
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
              {/* Language Selector */}
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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

              {/* Translate Entire Book Button */}
              {!isBookTranslated ? (
                <button
                  onClick={translateEntireBook}
                  disabled={isTranslating || targetLanguage === originalLanguage}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isTranslating || targetLanguage === originalLanguage
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
                    <>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      Translate Book
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={resetToOriginal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Original Language
                </button>
              )}

              {/* Current Language Indicator */}
              <div className={`px-3 py-2 rounded-lg text-sm ${
                isBookTranslated 
                  ? 'bg-green-100 text-green-800'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {isBookTranslated 
                  ? `📖 ${languages.find(l => l.code === targetLanguage)?.name}`
                  : `📖 ${languages.find(l => l.code === originalLanguage)?.name}`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Reader */}
        <div className="flex-1">
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
              // Store rendition reference for translation
              setRenditionRef(rendition);
              
              // Apply theme
              rendition.themes.default(readerTheme);
              
              // Best-effort: disable context menu/selection if accessible
              rendition.on('rendered', (_section, view) => {
                try {
                  const contents = typeof rendition.getContents === 'function' ? rendition.getContents() : [];
                  const list = Array.isArray(contents) ? contents : (contents ? [contents] : []);
                  list.forEach((c) => {
                    try {
                      if (c && c.document) {
                        c.document.addEventListener('contextmenu', (e) => e.preventDefault());
                        c.document.addEventListener('selectstart', (e) => e.preventDefault());
                      }
                    } catch (_) {}
                  });
                  if (view && view.document) {
                    try {
                      view.document.addEventListener('contextmenu', (e) => e.preventDefault());
                      view.document.addEventListener('selectstart', (e) => e.preventDefault());
                    } catch (_) {}
                  }
                } catch (e) {
                  // Silently ignore sandboxed about:srcdoc iframes
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
              flow: 'scrolled-doc',
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
      </div>

      {/* Translation Panel */}
      {showTranslationPanel && translatedContent && (
        <div className="absolute top-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Translation
              </h3>
              <button
                onClick={() => setShowTranslationPanel(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Original ({languages.find(l => l.code === originalLanguage)?.name || 'English'}):
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {translatedContent.original}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Translation ({languages.find(l => l.code === translatedContent.targetLanguage)?.name}):
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1 p-2 bg-blue-50 dark:bg-blue-900 rounded">
                  {translatedContent.translated}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
