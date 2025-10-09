import React, { useEffect, useRef, useState } from 'react';
import mammoth from 'mammoth';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { translateWithGoogle } from '../services/translationService';

const DOCXReader = ({ docxUrl, title = 'DOCX Reader', onClose }) => {
  const { isDarkMode } = useTheme();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'sw', name: 'Swahili' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' }
  ];

  useEffect(() => {
    const loadDocx = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(docxUrl, { credentials: 'omit' });
        if (!res.ok) throw new Error(`Failed to fetch DOCX: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        if (containerRef.current) {
          containerRef.current.innerHTML = html;
        }
      } catch (e) {
        console.error(e);
        setError('Unable to load DOCX file');
      } finally {
        setLoading(false);
      }
    };
    if (docxUrl) loadDocx();
  }, [docxUrl]);

  const translateContainer = async () => {
    if (!containerRef.current) return;
    setIsTranslating(true);
    try {
      const root = containerRef.current;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      const nodes = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.textContent && n.textContent.trim()) nodes.push(n);
      }

      const batchSize = 12;
      for (let i = 0; i < nodes.length; i += batchSize) {
        const batch = nodes.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (textNode) => {
            const src = textNode.textContent;
            try {
              const translated = await translateWithGoogle(src, targetLanguage, 'en');
              if (translated && translated !== src) textNode.textContent = translated;
            } catch (_) {}
          })
        );
        const progress = Math.round(((i + batch.length) / nodes.length) * 100);
        toast.loading(`Translating... ${progress}%`, { id: 'docx-translation-progress' });
      }
      toast.dismiss('docx-translation-progress');
      setIsTranslated(true);
      toast.success(`Document translated to ${languages.find(l => l.code === targetLanguage)?.name}`);
    } catch (e) {
      console.error(e);
      toast.dismiss('docx-translation-progress');
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col`}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-b`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} px-4 py-2 rounded-lg`}
          >
            ← Back
          </button>
          <div className="text-center flex-1">
            <h1 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold truncate`}>{title}</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>DOCX Reader - Translation Enabled</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 border rounded-lg`}
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <button
              onClick={translateContainer}
              disabled={isTranslating}
              className={`${isTranslating ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-4 py-2 rounded-lg`}
            >
              {isTranslating ? 'Translating…' : (isTranslated ? 'Re-translate' : 'Translate Document')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading DOCX...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className={`${isDarkMode ? 'prose-invert' : ''} prose max-w-4xl mx-auto px-6 py-6`}>
            <div ref={containerRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DOCXReader;


