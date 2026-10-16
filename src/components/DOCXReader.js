import React, { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './ui/Icon';

// In-app reader for .docx books: fetches the file, converts to HTML with
// mammoth (images become inline data-URIs), and renders it read-only.
const DocxReader = ({ bookUrl, bookTitle, onClose }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [fontSizePct, setFontSizePct] = useState(100);
  const contentRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('loading');
        const absolute = new URL(bookUrl, window.location.origin).href;
        const res = await fetch(absolute);
        if (!res.ok) throw new Error(`Could not load book file (${res.status})`);
        const arrayBuffer = await res.arrayBuffer();
        const { value, messages } = await mammoth.convertToHtml({ arrayBuffer });
        if (messages && messages.length) console.debug('mammoth messages:', messages);
        if (!cancelled) {
          setHtml(value || '<p><em>This document appears to be empty.</em></p>');
          setStatus('ready');
        }
      } catch (e) {
        console.error('DocxReader load failed:', e);
        if (!cancelled) {
          setErrorMsg(e.message || 'Failed to load document');
          setStatus('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [bookUrl]);

  const changeFontSize = (delta) =>
    setFontSizePct((p) => Math.min(140, Math.max(80, p + delta)));

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`flex items-center gap-3 px-4 py-3 border-b shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button
          onClick={onClose}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Icon name="arrowLeft" className="w-4 h-4" />
          Back
        </button>
        <h1 className={`flex-1 min-w-0 truncate font-display font-semibold text-[17px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {bookTitle}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeFontSize(-10)}
            className={`px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Decrease font size"
          >
            A−
          </button>
          <button
            onClick={() => changeFontSize(10)}
            className={`px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Increase font size"
          >
            A+
          </button>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Toggle theme"
          >
            <Icon name={isDarkMode ? 'sun' : 'moon'} className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading book…</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
            <Icon name="library" className={`w-14 h-14 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Couldn't open this book
            </p>
            <p className={`text-sm max-w-md ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{errorMsg}</p>
            <button onClick={onClose} className="a-btn-primary">Back to library</button>
          </div>
        )}
        {status === 'ready' && (
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
            <article
              ref={contentRef}
              className={`docx-content leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
              style={{ fontSize: `${fontSizePct}%` }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocxReader;
