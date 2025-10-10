import React, { useEffect, useRef, useState } from 'react';
import mammoth from 'mammoth';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { translateWithGoogle } from '../services/translationService';

const DOCXReader = ({ docxUrl, docxFile, title = 'DOCX Reader', onClose }) => {
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
    const toDirectDriveUrl = (url) => {
      try {
        const u = new URL(url);
        if (u.hostname.includes('drive.google.com')) {
          // Support both file/d/<id>/view and open?id=<id>
          const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
          const id = fileIdMatch?.[1] || u.searchParams.get('id');
          if (id) {
            return `https://drive.google.com/uc?export=download&id=${id}`;
          }
        }
      } catch (_) {}
      return url;
    };

    const arrayBufferFromFile = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    const loadDocx = async () => {
      setLoading(true);
      setError(null);
      try {
        let arrayBuffer;
        if (docxFile instanceof File) {
          arrayBuffer = await arrayBufferFromFile(docxFile);
        } else if (docxUrl) {
          const normalizedUrl = toDirectDriveUrl(docxUrl);
          const res = await fetch(normalizedUrl, { mode: 'cors', credentials: 'omit', redirect: 'follow', referrerPolicy: 'no-referrer' });
          if (!res.ok) throw new Error(`Failed to fetch DOCX: ${res.status}`);
          arrayBuffer = await res.arrayBuffer();
        } else {
          throw new Error('No DOCX source provided');
        }
        // Map common Word styles to semantic HTML to preserve structure
        const options = {
          styleMap: [
            "p[style-name='Title'] => h1.title:fresh",
            "p[style-name='Subtitle'] => h2.subtitle:fresh",
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Quote'] => blockquote:fresh",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => em",
            "table => table.table table-striped",
            "p[style-name='Caption'] => figcaption:fresh"
          ]
        };

        const { value: html } = await mammoth.convertToHtml({ arrayBuffer }, options);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <style>
              .docx-container { line-height: 1.6; }
              .docx-container h1, .docx-container h2, .docx-container h3 { margin: 1.2em 0 0.6em; }
              .docx-container p { margin: 0.6em 0; }
              .docx-container ul, .docx-container ol { margin: 0.8em 1.2em; }
              .docx-container table { border-collapse: collapse; width: 100%; margin: 1em 0; }
              .docx-container table td, .docx-container table th { border: 1px solid rgba(0,0,0,0.1); padding: 6px 8px; }
              .docx-container blockquote { border-left: 4px solid rgba(59,130,246,0.5); padding-left: 12px; margin-left: 0; color: inherit; }
            </style>
            <div class="docx-container">${html}</div>
          `;
        }
      } catch (e) {
        console.error(e);
        setError('Unable to load DOCX file. Try uploading the file directly.');
      } finally {
        setLoading(false);
      }
    };
    if (docxFile || docxUrl) loadDocx();
  }, [docxUrl, docxFile]);

  const translateContainer = async () => {
    if (!containerRef.current) return;
    setIsTranslating(true);
    try {
      const root = containerRef.current;
      // Translate by blocks to reduce layout fragmentation and improve quality
      const blocks = Array.from(
        root.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, figcaption, blockquote')
      );

      const batchSize = 8;
      for (let i = 0; i < blocks.length; i += batchSize) {
        const batch = blocks.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (el) => {
            const src = el.textContent || '';
            try {
              const translated = await translateWithGoogle(src, targetLanguage, 'en');
              if (translated && translated !== src) el.textContent = translated;
            } catch (_) {}
          })
        );
        const progress = Math.round(((i + batch.length) / blocks.length) * 100);
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


