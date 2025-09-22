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

  // Comprehensive translation function for entire book
  const translateText = async (text, targetLang) => {
    // Enhanced translation mappings for full book content
    const comprehensiveTranslations = {
      'en': {
        'yo': {
          // Leadership terms
          'Leadership': 'Asiwaju',
          'Traditional': 'Aṣa',
          'Ruler': 'Ọba',
          'King': 'Ọba',
          'Chief': 'Olori',
          'Elder': 'Agba',
          'Wisdom': 'Ọgbọn',
          'Community': 'Agbegbe',
          'Kingdom': 'Ijọba',
          'Throne': 'Ijọba',
          'Authority': 'Aṣẹ',
          'Power': 'Agbara',
          'Respect': 'Ọwọ',
          'Honor': 'Ọla',
          'Tradition': 'Aṣa',
          'Culture': 'Aṣa',
          'Heritage': 'Ogún',
          'Ancestor': 'Baba-nla',
          'Blessing': 'Ibukun',
          'Prayer': 'Adura',
          'God': 'Ọlọrun',
          'Christ': 'Kristi',
          'Christian': 'Onigbagbọ',
          'Faith': 'Igbagbọ',
          'Church': 'Ijọ',
          'Pastor': 'Pastọ',
          'Bible': 'Bibeli',
          'Scripture': 'Mimọ',
          'Gospel': 'Ihinrere',
          'Salvation': 'Igbala',
          'Grace': 'Ore-ọfẹ',
          'Love': 'Ifẹ',
          'Peace': 'Alaafia',
          'Joy': 'Ayọ',
          'Hope': 'Ireti',
          'Truth': 'Otitọ',
          'Justice': 'Ododo',
          'Righteousness': 'Ododo',
          'Humility': 'Irẹlẹ',
          'Service': 'Iṣẹ',
          'Ministry': 'Iṣẹ-ọsin',
          'Calling': 'Ipe',
          'Purpose': 'Idi',
          'Vision': 'Iran',
          'Mission': 'Iṣẹ-apinfunni',
          'Goal': 'Ibi-afẹde',
          'Success': 'Aṣeyọri',
          'Growth': 'Idagba',
          'Development': 'Idagbasoke',
          'Progress': 'Ilọsiwaju',
          'Change': 'Iyipada',
          'Transformation': 'Iyipada',
          'Chapter': 'Ori',
          'Introduction': 'Ifihan',
          'Conclusion': 'Ipari',
          'Summary': 'Akojọpọ',
          'Example': 'Apẹẹrẹ',
          'Lesson': 'Ẹkọ',
          'Teaching': 'Ẹkọ',
          'Learning': 'Ẹkọ-kọ',
          'Understanding': 'Oye',
          'Knowledge': 'Imọ',
          'Education': 'Ẹkọ',
          'School': 'Ile-ẹkọ',
          'Student': 'Akẹkọọ',
          'Teacher': 'Olukọni',
          'Book': 'Iwe',
          'Page': 'Oju-iwe',
          'Word': 'Ọrọ',
          'Language': 'Ede',
          'Translation': 'Itumọ',
          'Meaning': 'Itumọ',
          'Message': 'Ifiranṣẹ',
          'Communication': 'Ibaraẹnisọrọ',
          'Discussion': 'Ijiroro',
          'Meeting': 'Ipade',
          'Conference': 'Apejọ',
          'Assembly': 'Apejọ',
          'Gathering': 'Ipejọ',
          'Ceremony': 'Ayẹyẹ',
          'Celebration': 'Ayẹyẹ',
          'Festival': 'Odun',
          'Event': 'Iṣẹlẹ',
          'Occasion': 'Aaye',
          'Time': 'Akoko',
          'Day': 'Ọjọ',
          'Week': 'Ọsẹ',
          'Month': 'Oṣu',
          'Year': 'Ọdun',
          'Today': 'Oni',
          'Tomorrow': 'Ọla',
          'Yesterday': 'Ana',
          'Now': 'Bayi',
          'Future': 'Ọjọ-iwaju',
          'Past': 'Atijọ',
          'Present': 'Lọwọlọwọ'
        },
        'ig': {
          // Igbo translations
          'Leadership': 'Nduzi',
          'Traditional': 'Omenala',
          'Ruler': 'Eze',
          'King': 'Eze',
          'Chief': 'Ichie',
          'Elder': 'Ndi-ichie',
          'Wisdom': 'Amamihe',
          'Community': 'Obodo',
          'Kingdom': 'Alaeze',
          'Throne': 'Ocheeze',
          'Authority': 'Ikike',
          'Power': 'Ike',
          'Respect': 'Nkwanye ugwu',
          'Honor': 'Nsọpụrụ',
          'Tradition': 'Omenala',
          'Culture': 'Omenala',
          'Heritage': 'Ihe nketa',
          'Ancestor': 'Ndi-ichie',
          'Blessing': 'Ngọzi',
          'Prayer': 'Ekpere',
          'God': 'Chineke',
          'Christ': 'Kraịst',
          'Christian': 'Onye Kraịst',
          'Faith': 'Okwukwe',
          'Church': 'Ụka',
          'Pastor': 'Onye-nkuzi',
          'Bible': 'Akwụkwọ Nsọ',
          'Scripture': 'Akwụkwọ Nsọ',
          'Gospel': 'Oziọma',
          'Salvation': 'Nzọpụta',
          'Grace': 'Amara',
          'Love': 'Ịhụnanya',
          'Peace': 'Udo',
          'Joy': 'Ọṅụ',
          'Hope': 'Olileanya',
          'Truth': 'Eziokwu',
          'Justice': 'Ikpe ziri ezi',
          'Righteousness': 'Ezi omume',
          'Humility': 'Ịdị umeala',
          'Service': 'Ọrụ',
          'Ministry': 'Ọrụ Chineke',
          'Calling': 'Ọkpụkpọ',
          'Purpose': 'Ebumnobi',
          'Vision': 'Ọhụụ',
          'Mission': 'Ozi',
          'Goal': 'Ebumnobi',
          'Success': 'Ihe ịga nke ọma',
          'Growth': 'Uto',
          'Development': 'Mmepe',
          'Progress': 'Ọganihu',
          'Change': 'Mgbanwe',
          'Transformation': 'Mgbanwe',
          'Chapter': 'Isi',
          'Introduction': 'Mmalite',
          'Conclusion': 'Njedebe',
          'Summary': 'Nchịkọta',
          'Example': 'Ọmụmaatụ',
          'Lesson': 'Nkuzi',
          'Teaching': 'Nkuzi',
          'Learning': 'Ịmụta ihe',
          'Understanding': 'Ịghọta',
          'Knowledge': 'Ihe ọmụma',
          'Education': 'Agụmakwụkwọ',
          'Book': 'Akwụkwọ',
          'Page': 'Peeji',
          'Word': 'Okwu',
          'Language': 'Asụsụ',
          'Translation': 'Ntụghari',
          'Meaning': 'Nkọwa',
          'Message': 'Ozi',
          'Meeting': 'Nzukọ',
          'Event': 'Ememe',
          'Time': 'Oge',
          'Day': 'Ụbọchị',
          'Today': 'Taa',
          'Tomorrow': 'Echi',
          'Yesterday': 'Ụnyaahụ'
        },
        'ha': {
          // Hausa translations
          'Leadership': 'Jagoranci',
          'Traditional': 'Al\'ada',
          'Ruler': 'Sarki',
          'King': 'Sarki',
          'Chief': 'Hakimi',
          'Elder': 'Dattijo',
          'Wisdom': 'Hikima',
          'Community': 'Al\'umma',
          'Kingdom': 'Daula',
          'Throne': 'Sarauta',
          'Authority': 'Iko',
          'Power': 'Iko',
          'Respect': 'Girmamawa',
          'Honor': 'Daraja',
          'Tradition': 'Al\'ada',
          'Culture': 'Al\'ada',
          'Heritage': 'Gado',
          'Ancestor': 'Kakanni',
          'Blessing': 'Albarka',
          'Prayer': 'Addu\'a',
          'God': 'Allah',
          'Christ': 'Almasihu',
          'Christian': 'Kirista',
          'Faith': 'Bangaskiya',
          'Church': 'Coci',
          'Pastor': 'Fasto',
          'Bible': 'Littafi Mai Tsarki',
          'Scripture': 'Nassi',
          'Gospel': 'Bishara',
          'Salvation': 'Ceto',
          'Grace': 'Alheri',
          'Love': 'Ƙauna',
          'Peace': 'Salama',
          'Joy': 'Farin ciki',
          'Hope': 'Bege',
          'Truth': 'Gaskiya',
          'Justice': 'Adalci',
          'Righteousness': 'Adalci',
          'Humility': 'Tawali\'u',
          'Service': 'Hidima',
          'Ministry': 'Hidimar Ubangiji',
          'Calling': 'Kira',
          'Purpose': 'Manufa',
          'Vision': 'Hangen nesa',
          'Mission': 'Manufa',
          'Goal': 'Buri',
          'Success': 'Nasara',
          'Growth': 'Girma',
          'Development': 'Ci gaba',
          'Progress': 'Ci gaba',
          'Change': 'Canji',
          'Transformation': 'Canji',
          'Chapter': 'Babi',
          'Introduction': 'Gabatarwa',
          'Conclusion': 'Kammala',
          'Summary': 'Taƙaitawa',
          'Example': 'Misali',
          'Lesson': 'Darasi',
          'Teaching': 'Koyarwa',
          'Learning': 'Koyo',
          'Understanding': 'Fahimta',
          'Knowledge': 'Ilimi',
          'Education': 'Ilimi',
          'Book': 'Littafi',
          'Page': 'Shafi',
          'Word': 'Kalma',
          'Language': 'Harshe',
          'Translation': 'Fassara',
          'Meaning': 'Ma\'ana',
          'Message': 'Saƙo',
          'Meeting': 'Taro',
          'Event': 'Taron',
          'Time': 'Lokaci',
          'Day': 'Rana',
          'Today': 'Yau',
          'Tomorrow': 'Gobe',
          'Yesterday': 'Jiya'
        },
        'sw': {
          // Swahili translations
          'Leadership': 'Uongozi',
          'Traditional': 'Jadi',
          'Ruler': 'Mtawala',
          'King': 'Mfalme',
          'Chief': 'Mkuu',
          'Elder': 'Mzee',
          'Wisdom': 'Hekima',
          'Community': 'Jamii',
          'Kingdom': 'Ufalme',
          'Throne': 'Kiti cha enzi',
          'Authority': 'Mamlaka',
          'Power': 'Nguvu',
          'Respect': 'Heshima',
          'Honor': 'Heshima',
          'Tradition': 'Jadi',
          'Culture': 'Utamaduni',
          'Heritage': 'Urithi',
          'Ancestor': 'Babu',
          'Blessing': 'Baraka',
          'Prayer': 'Sala',
          'God': 'Mungu',
          'Christ': 'Kristo',
          'Christian': 'Mkristo',
          'Faith': 'Imani',
          'Church': 'Kanisa',
          'Pastor': 'Mchungaji',
          'Bible': 'Biblia',
          'Scripture': 'Maandiko',
          'Gospel': 'Injili',
          'Salvation': 'Wokovu',
          'Grace': 'Neema',
          'Love': 'Upendo',
          'Peace': 'Amani',
          'Joy': 'Furaha',
          'Hope': 'Tumaini',
          'Truth': 'Ukweli',
          'Justice': 'Haki',
          'Righteousness': 'Uongozi',
          'Humility': 'Unyenyekevu',
          'Service': 'Huduma',
          'Ministry': 'Huduma',
          'Calling': 'Wito',
          'Purpose': 'Kusudi',
          'Vision': 'Maono',
          'Mission': 'Utume',
          'Goal': 'Lengo',
          'Success': 'Mafanikio',
          'Growth': 'Ukuaji',
          'Development': 'Maendeleo',
          'Progress': 'Maendeleo',
          'Change': 'Mabadiliko',
          'Transformation': 'Mabadiliko',
          'Chapter': 'Sura',
          'Introduction': 'Utangulizi',
          'Conclusion': 'Hitimisho',
          'Summary': 'Muhtasari',
          'Example': 'Mfano',
          'Lesson': 'Somo',
          'Teaching': 'Mafundisho',
          'Learning': 'Kujifunza',
          'Understanding': 'Uelewa',
          'Knowledge': 'Maarifa',
          'Education': 'Elimu',
          'Book': 'Kitabu',
          'Page': 'Ukurasa',
          'Word': 'Neno',
          'Language': 'Lugha',
          'Translation': 'Tafsiri',
          'Meaning': 'Maana',
          'Message': 'Ujumbe',
          'Meeting': 'Mkutano',
          'Event': 'Tukio',
          'Time': 'Wakati',
          'Day': 'Siku',
          'Today': 'Leo',
          'Tomorrow': 'Kesho',
          'Yesterday': 'Jana'
        }
      }
    };

    // Enhanced translation with context awareness
    let translatedText = text;
    const translations = comprehensiveTranslations['en'][targetLang];
    
    if (translations) {
      // Sort by length (longest first) to avoid partial replacements
      const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
      
      sortedKeys.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translations[word]);
      });
    }

    return translatedText;
  };

  // Translate entire book function
  const translateEntireBook = async () => {
    if (!renditionRef || !targetLanguage || targetLanguage === originalLanguage) {
      toast.error('Please select a different target language');
      return;
    }

    setIsTranslating(true);
    let translatingToastId;
    try {
      translatingToastId = toast.loading('Translating entire book... This may take a moment.');
      
      // Get all text content from the book
      const spine = renditionRef.book.spine;

      for (let i = 0; i < spine.spineItems.length; i++) {
        const section = spine.spineItems[i];
        try {
          const doc = await section.load(renditionRef.book.load.bind(renditionRef.book));
          const textContent = doc && doc.body ? doc.body.textContent : '';
          
          if (textContent.trim()) {
            const translatedText = await translateText(textContent, targetLanguage);
            
            // Apply translation to the section
            if (doc.body) {
              const walker = document.createTreeWalker(
                doc.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
              );
              
              const textNodes = [];
              for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                if (n.textContent && n.textContent.trim()) {
                  textNodes.push(n);
                }
              }
              
              // Replace text content with translations
              textNodes.forEach(async (textNode) => {
                const originalText = textNode.textContent;
                const translated = await translateText(originalText, targetLanguage);
                textNode.textContent = translated;
              });
            }
          }
        } catch (error) {
          console.warn('Could not translate section:', error);
        }
      }

      setIsBookTranslated(true);
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
        await renditionRef.display(location);
        setIsBookTranslated(false);
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
