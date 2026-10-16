import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { translateWithGoogle, batchTranslate, SUPPORTED_LANGUAGES } from '../services/translationService';
import Icon from './ui/Icon';

const EPUBReader = ({ bookUrl, bookTitle, onClose }) => {
  const { isDarkMode, toggleTheme } = useTheme();
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
  const [toc, setToc] = useState([]);
  const [fontSizePct, setFontSizePct] = useState(100);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentChapter, setCurrentChapter] = useState('');


  // Helper function to handle CORS issues
  const getEpubUrl = (url) => {
    // Validate URL first (resolve relative /uploads/... paths against origin)
    try {
      new URL(url, window.location.origin);
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

  const languages = SUPPORTED_LANGUAGES;

  // Font size controls (A- / A+)
  useEffect(() => {
    if (renditionRef) {
      try {
        renditionRef.themes.fontSize(`${fontSizePct}%`);
      } catch (e) { /* rendition not ready */ }
    }
  }, [fontSizePct, renditionRef]);

  const changeFontSize = (delta) => {
    setFontSizePct((p) => Math.min(140, Math.max(80, p + delta)));
  };

  const goToHref = (href) => {
    if (renditionRef && href) {
      renditionRef.display(href);
    }
  };

  const addBookmark = () => {
    if (!location) return;
    const chapter = currentChapter || 'Page';
    if (bookmarks.some((b) => b.cfi === location)) return;
    setBookmarks([...bookmarks, { cfi: location, label: chapter }]);
    toast.success('Bookmark saved');
  };

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
    let changedCount = 0;

    // Batch translate — the backend handles caching and chunking server-side.
    const batchSize = 60;
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);
      const texts = batch.map((n) => n.textContent);
      try {
        const translated = await batchTranslate(texts, targetLanguage, originalLanguage);
        batch.forEach((textNode, idx) => {
          const t = translated[idx];
          if (t && t !== textNode.textContent) {
            textNode.textContent = t;
            changedCount++;
          }
        });
      } catch (error) {
        console.warn('Translation error for batch:', error);
      }

      // Update progress
      const progress = Math.round(((i + batch.length) / nodes.length) * 100);
      toast.loading(`Translating... ${progress}%`, { id: 'epub-translation-progress' });
    }
    return changedCount;
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

      let totalChanged = 0;
      for (let i = 0; i < views._views.length; i++) {
        const view = views._views[i];

        if (view && view.document) {
          console.log(`Translating view ${i + 1}/${views._views.length}`);
          totalChanged += (await translateDocumentNodes(view.document)) || 0;
        }
      }

      toast.dismiss('epub-translation-progress');
      if (totalChanged === 0 && targetLanguage !== originalLanguage) {
        throw new Error('Translation provider returned no translations');
      }
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

  const handleTextSelection = (cfiRange) => {
    if (!renditionRef) return;
    try {
      renditionRef.book.getRange(cfiRange).then((range) => {
        const text = range ? range.toString().trim() : '';
        if (text) {
          setSelections((prev) => [...prev, { cfiRange, contents: text }]);
          console.log('Text selected:', text.slice(0, 80));
        }
      }).catch(() => {});
    } catch (e) { /* range unavailable */ }
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

      if (!translated || translated === lastSelection.contents) {
        toast.error('Translation is unavailable right now. Please try again later.');
        return;
      }

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
      background: '#131A3A',
      color: '#EEF0F8'
    },
    link: {
      color: '#9DB0FF'
    }
  } : {
    body: {
      background: '#FFFCF6',
      color: '#14182B'
    },
    link: {
      color: '#17275F'
    }
  };

  const ghostBtn =
    'w-11 h-11 inline-flex items-center justify-center rounded-[10px] border transition-colors';
  const ghostStyle = {
    borderColor: 'var(--border)',
    background: 'transparent',
    color: 'var(--ink)',
  };

  // If URL is invalid, show error
  if (!epubUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center p-8 max-w-md">
          <Icon name="close" size={48} className="mx-auto mb-4" style={{ color: 'var(--danger-fg)' }} />
          <h3 className="font-display font-bold text-[24px] mb-3" style={{ color: 'var(--ink)' }}>
            Invalid book URL
          </h3>
          <p className="text-[15px] mb-6" style={{ color: 'var(--muted)' }}>
            The book file URL is not valid. Please contact an administrator.
          </p>
          <button onClick={onClose} className="a-btn-primary">
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* ===== Header ===== */}
      <header
        className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className={`${ghostBtn} !w-auto px-3 gap-2 text-[15px] font-semibold`}
            style={ghostStyle}
            aria-label="Back to library"
          >
            <Icon name="arrowLeft" size={18} />
            <span className="hidden sm:inline">Library</span>
          </button>
          <div className="min-w-0">
            <div className="font-display font-semibold text-[19px] leading-[1.2] truncate">{bookTitle}</div>
            <div className="text-[13.5px] truncate" style={{ color: 'var(--muted)' }}>
              {currentChapter ? `${currentChapter} · ` : ''}EPUB · translation enabled
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeFontSize(-10)} className={`${ghostBtn} font-bold text-[15px]`} style={ghostStyle} aria-label="Smaller text">
            A−
          </button>
          <button onClick={() => changeFontSize(10)} className={`${ghostBtn} font-bold text-[20px]`} style={ghostStyle} aria-label="Larger text">
            A+
          </button>
          <button onClick={addBookmark} className={ghostBtn} style={ghostStyle} aria-label="Bookmark this page">
            <Icon name="bookmark" size={20} />
          </button>
          <button
            onClick={toggleTheme}
            className={`${ghostBtn} !w-auto px-3.5 gap-2 text-[15px] font-semibold`}
            style={ghostStyle}
            aria-label={isDarkMode ? 'Switch to day reading' : 'Switch to night reading'}
          >
            <Icon name={isDarkMode ? 'sun' : 'moon'} size={18} />
            <span className="hidden sm:inline">{isDarkMode ? 'Day' : 'Night'}</span>
          </button>
        </div>
      </header>

      {/* ===== 3-pane body ===== */}
      <div className="flex-1 flex flex-wrap items-stretch min-h-0">

        {/* Contents rail */}
        <aside
          className="hidden md:flex flex-col gap-1.5 px-4 py-6 border-r overflow-y-auto w-[280px] flex-shrink-0"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="px-3 pb-2 text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
            Contents
          </div>
          {toc.length === 0 ? (
            <p className="px-3 text-[14px]" style={{ color: 'var(--muted)' }}>Loading chapters…</p>
          ) : (
            toc.map((item, i) => {
              const active = item.label?.trim() === currentChapter;
              return (
                <button
                  key={item.href || i}
                  onClick={() => goToHref(item.href)}
                  className="min-h-[44px] flex items-center px-3 rounded-[10px] text-left text-[15.5px] transition-colors"
                  style={
                    active
                      ? { background: 'var(--brand-soft)', color: 'var(--brand)', fontWeight: 700 }
                      : { color: 'var(--muted)' }
                  }
                >
                  {i + 1} · {item.label?.trim() || `Chapter ${i + 1}`}
                </button>
              );
            })
          )}
        </aside>

        {/* Page */}
        <main className="flex-1 min-w-0 flex flex-col items-center px-4 sm:px-8 py-6 overflow-hidden">
          {corsError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md">
                <Icon name="warning" size={48} className="mx-auto mb-4" style={{ color: 'var(--warn-fg)' }} />
                <h3 className="font-display font-bold text-[24px] mb-3" style={{ color: 'var(--ink)' }}>
                  File access issue
                </h3>
                <p className="text-[15px] mb-6" style={{ color: 'var(--muted)' }}>
                  The book file could not be loaded. Try a PDF upload, or contact an administrator.
                </p>
                <button onClick={onClose} className="a-btn-primary">
                  Back to Library
                </button>
              </div>
            </div>
          ) : (
            <article
              className="w-full max-w-[760px] flex-1 min-h-0 rounded-[16px] border overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <ReactReader
                url={epubUrl}
                location={location}
                locationChanged={(epubcfi) => setLocation(epubcfi)}
                handleTextSelection={handleTextSelection}
                getRendition={(rendition) => {
                  // Store rendition reference for translation
                  setRenditionRef(rendition);

                  // Apply theme
                  rendition.themes.default(readerTheme);
                  try {
                    rendition.themes.fontSize(`${fontSizePct}%`);
                  } catch (e) { /* not ready */ }

                  // Load table of contents
                  try {
                    rendition.book.loaded.navigation.then((nav) => {
                      if (nav && nav.toc) setToc(nav.toc);
                    });
                  } catch (e) { /* no nav */ }

                  // Track current chapter
                  rendition.on('relocated', (loc) => {
                    try {
                      const spineItem = rendition.book.spine.get(loc?.start?.cfi);
                      const navItem = rendition.book.navigation?.toc?.find(
                        (t) => spineItem && spineItem.href && t.href && spineItem.href.includes(t.href.split('#')[0])
                      );
                      if (navItem) setCurrentChapter(navItem.label?.trim());
                    } catch (e) { /* ignore */ }
                  });

                  // Best-effort: disable right-click context menu (selection stays enabled for translate)
                  rendition.on('rendered', (_section, view) => {
                    try {
                      const contents = typeof rendition.getContents === 'function' ? rendition.getContents() : [];
                      const list = Array.isArray(contents) ? contents : (contents ? [contents] : []);
                      list.forEach((c) => {
                        try {
                          if (c && c.document) {
                            c.document.addEventListener('contextmenu', (e) => e.preventDefault());
                          }
                        } catch (_) {}
                      });
                      if (view && view.document) {
                        try {
                          view.document.addEventListener('contextmenu', (e) => e.preventDefault());
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
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand)' }} />
                      <p style={{ color: 'var(--muted)' }}>Loading EPUB book...</p>
                    </div>
                  </div>
                }
              />
            </article>
          )}
        </main>

        {/* Translate rail */}
        <aside
          className="hidden lg:flex flex-col gap-5 px-5 py-6 border-l overflow-y-auto w-[300px] flex-shrink-0"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <div className="text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
            Translate
          </div>

          {/* Language list */}
          <div className="flex flex-col gap-1">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setTargetLanguage(l.code)}
                className="min-h-[44px] flex items-center px-3 rounded-[10px] text-left text-[15.5px] transition-colors"
                style={
                  targetLanguage === l.code
                    ? { background: 'var(--brand-soft)', color: 'var(--brand)', fontWeight: 700 }
                    : { color: 'var(--ink)' }
                }
              >
                {l.name}
              </button>
            ))}
          </div>

          {/* Selection card */}
          <div className="a-card !p-4">
            <div className="font-semibold">Selection</div>
            <div className="mt-0.5 text-[14.5px]" style={{ color: 'var(--muted)' }}>
              Select text on the page to translate it in place.
            </div>
            <button
              onClick={translateSelectedText}
              disabled={isTranslating}
              className="a-btn-outline w-full mt-3 !text-[15.5px] disabled:opacity-60"
            >
              {isTranslating ? 'Translating…' : 'Translate selection'}
            </button>
          </div>

          {/* Whole chapter card */}
          <div className="a-card !p-4">
            <div className="font-semibold">Whole chapter</div>
            <div className="mt-0.5 text-[14.5px]" style={{ color: 'var(--muted)' }}>
              {isBookTranslated
                ? `Translated to ${languages.find((l) => l.code === targetLanguage)?.name}`
                : `Translate into ${languages.find((l) => l.code === targetLanguage)?.name}`}
            </div>
            {isBookTranslated ? (
              <button
                onClick={resetToOriginal}
                className="a-btn-gold w-full mt-3.5 !text-[15.5px] !font-bold"
              >
                Show original
              </button>
            ) : (
              <button
                onClick={translateEntireBook}
                disabled={isTranslating || targetLanguage === originalLanguage}
                className="a-btn-primary w-full mt-3.5 !text-[15.5px] !font-bold disabled:opacity-60"
              >
                {isTranslating ? 'Translating…' : 'Translate whole chapter'}
              </button>
            )}
          </div>

          {/* Bookmarks */}
          <div>
            <div className="text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--gold)' }}>
              Bookmarks
            </div>
            {bookmarks.length === 0 ? (
              <p className="mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>
                Use the bookmark button above to save your place.
              </p>
            ) : (
              <div className="mt-2 flex flex-col">
                {bookmarks.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => goToHref(b.cfi)}
                    className="min-h-[48px] flex items-center gap-2.5 border-t text-left text-[15.5px] transition-colors hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                  >
                    <Icon name="bookmark" size={18} className="flex-shrink-0" style={{ color: 'var(--gold)' }} />
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Translation result panel */}
      {showTranslationPanel && translatedContent && (
        <div
          className="absolute bottom-6 right-6 w-80 rounded-[16px] border shadow-xl z-50 max-h-96 overflow-y-auto"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display font-semibold text-[19px]" style={{ color: 'var(--ink)' }}>
                Translation
              </h3>
              <button
                onClick={() => setShowTranslationPanel(false)}
                className="w-9 h-9 inline-flex items-center justify-center rounded-[8px] transition-colors"
                style={{ color: 'var(--muted)' }}
                aria-label="Close translation"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>
                  Original ({languages.find(l => l.code === originalLanguage)?.name || 'English'}):
                </label>
                <p className="text-[14px] mt-1 p-2.5 rounded-[8px]" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                  {translatedContent.original}
                </p>
              </div>

              <div>
                <label className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>
                  Translation ({languages.find(l => l.code === translatedContent.targetLanguage)?.name}):
                </label>
                <p className="text-[14px] mt-1 p-2.5 rounded-[8px]" style={{ background: 'var(--warn-bg)', color: 'var(--ink)' }}>
                  {translatedContent.translated}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-40">
        <div
          className="px-3 py-1 rounded-[8px] text-[12px] font-medium"
          style={{ background: 'var(--surface)', color: 'var(--muted)', opacity: 0.8, border: '1px solid var(--border)' }}
        >
          ATRC Digital Library
        </div>
      </div>
    </div>
  );
};

export default EPUBReader;
