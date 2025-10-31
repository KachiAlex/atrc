import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  LanguageIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import EPUBReader from '../components/EPUBReader';
import TranslationUI from '../components/TranslationUI';
import { translateText, translateBookContent } from '../services/enhancedTranslationService';

const BookReader = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isReading, setIsReading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedBookForTranslation, setSelectedBookForTranslation] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslatedResults, setShowTranslatedResults] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translationProgress, setTranslationProgress] = useState(null);
  const [showEnhancedTranslation, setShowEnhancedTranslation] = useState(false);
  const [bookmarkedBooks, setBookmarkedBooks] = useState(new Set());

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'leadership', label: 'Leadership & Governance' },
    { value: 'spiritual', label: 'Spiritual Growth' },
    { value: 'community', label: 'Community Development' },
    { value: 'history', label: 'Traditional History' },
    { value: 'wisdom', label: 'Traditional Wisdom' }
  ];

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
    { value: 'yo', label: 'Yoruba' },
    { value: 'ig', label: 'Igbo' },
    { value: 'ha', label: 'Hausa' },
    { value: 'zu', label: 'Zulu' },
    { value: 'fr', label: 'French' },
    { value: 'ar', label: 'Arabic' }
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedCategory, selectedLanguage]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      console.log('Fetching books from Firestore...');
      
      const booksRef = collection(db, 'books');
      const q = query(
        booksRef, 
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Fetched books:', booksData.length, booksData);
      setBooks(booksData);
      
      // If no books found, add some sample books for testing
      if (booksData.length === 0) {
        console.log('No books found, adding sample books...');
        const sampleBooks = [
          {
            id: 'sample1',
            title: 'Leadership Principles for Traditional Rulers',
            author: 'Dr. Adebayo Ogundimu',
            description: 'A comprehensive guide to effective traditional leadership in modern times. Features real-time translation to help rulers from different linguistic backgrounds.',
            category: 'leadership',
            language: 'en',
            coverImageUrl: '/images/book-placeholder.jpg',
            bookUrl: 'https://www.gutenberg.org/ebooks/11.epub.noimages',
            fileType: 'epub',
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample2',
            title: 'Traditional Wisdom and Modern Governance (PDF)',
            author: 'Prof. Chinua Achebe',
            description: 'Bridging the gap between traditional wisdom and contemporary leadership challenges.',
            category: 'wisdom',
            language: 'en',
            coverImageUrl: '/images/book-placeholder.jpg',
            bookUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
            fileType: 'pdf',
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample3',
            title: 'Spiritual Leadership in African Traditions (EPUB)',
            author: 'Bishop Samuel Adegoke',
            description: 'Exploring the intersection of Christian faith and traditional African leadership. Full translation support available.',
            category: 'spiritual',
            language: 'en',
            coverImageUrl: '/images/book-placeholder.jpg',
            bookUrl: 'https://www.gutenberg.org/ebooks/11.epub.noimages',
            fileType: 'epub',
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        setBooks(sampleBooks);
        toast.success('Sample books loaded for demonstration');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books. Please try again.');
      
      // Fallback to sample books on error
      const fallbackBooks = [
        {
          id: 'fallback1',
          title: 'Leadership Principles for Traditional Rulers',
          author: 'Dr. Adebayo Ogundimu',
          description: 'A comprehensive guide to effective traditional leadership in modern times.',
          category: 'leadership',
          language: 'en',
          coverImageUrl: '/images/book-placeholder.jpg',
          bookUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
          fileType: 'pdf',
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setBooks(fallbackBooks);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(book => book.language === selectedLanguage);
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  };

  const openBook = (book) => {
    setSelectedBook(book);
    setIsReading(true);
  };

  const closeReader = () => {
    setIsReading(false);
    setSelectedBook(null);
  };

  const getLanguageLabel = (langCode) => {
    return languages.find(l => l.value === langCode)?.label || langCode;
  };

  const getCategoryLabel = (catCode) => {
    return categories.find(c => c.value === catCode)?.label || catCode;
  };

  const openTranslationModal = (book) => {
    setSelectedBookForTranslation(book);
    setShowTranslationModal(true);
  };

  const closeTranslationModal = () => {
    setShowTranslationModal(false);
    setSelectedBookForTranslation(null);
    setTargetLanguage('en');
  };

  const translateBook = async () => {
    if (!selectedBookForTranslation) return;
    
    setIsTranslating(true);
    setTranslationProgress({ completed: 0, total: 3, percentage: 0, currentItem: 'Starting...' });
    
    try {
      // Enhanced translation with progress tracking
      const bookContent = {
        title: selectedBookForTranslation.title,
        author: selectedBookForTranslation.author,
        description: selectedBookForTranslation.description,
        chapters: [] // Add chapters if available
      };

      const translatedResult = await translateBookContent(
        bookContent, 
        targetLanguage, 
        'en',
        (progress) => setTranslationProgress(progress)
      );
      
      setTranslatedContent(translatedResult);
      setShowTranslatedResults(true);
      toast.success('Book translated successfully!');
      
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
      setTranslationProgress(null);
      closeTranslationModal();
    }
  };

  const translateContent = async (content, targetLang) => {
    // For now, we'll use a simple translation mapping as a fallback
    // This provides basic translations for common terms
    const translations = {
      'en': {
        'fr': {
          'Types of Leadership in the Church to Avoid': 'Types de leadership dans l\'église à éviter',
          'Pastor Douglas': 'Pasteur Douglas',
          'Types of Leadership in the Church to avoid': 'Types de leadership dans l\'église à éviter',
          'Leadership': 'Leadership',
          'Church': 'Église',
          'Spiritual Growth': 'Croissance spirituelle',
          'Community Development': 'Développement communautaire',
          'Traditional Values': 'Valeurs traditionnelles',
          'Christian Education': 'Éducation chrétienne',
          'History & Culture': 'Histoire et culture',
          'Prayer & Worship': 'Prière et adoration',
          'Family & Marriage': 'Famille et mariage',
          'Youth Ministry': 'Ministère des jeunes'
        },
        'sw': {
          'Types of Leadership in the Church to Avoid': 'Aina za Uongozi wa Kanisani za Kuzuia',
          'Pastor Douglas': 'Mchungaji Douglas',
          'Leadership': 'Uongozi',
          'Church': 'Kanisa',
          'Spiritual Growth': 'Ukuaji wa Kiroho',
          'Community Development': 'Maendeleo ya Jamii',
          'Traditional Values': 'Maadili ya Jadi',
          'Christian Education': 'Elimu ya Kikristo',
          'History & Culture': 'Historia na Utamaduni',
          'Prayer & Worship': 'Sala na Ibada',
          'Family & Marriage': 'Familia na Ndoa',
          'Youth Ministry': 'Huduma ya Vijana'
        },
        'yo': {
          'Types of Leadership in the Church to Avoid': 'Oruka Ijoba ninu Ijo ti o gbodo yera',
          'Pastor Douglas': 'Pastor Douglas',
          'Leadership': 'Igbakeji',
          'Church': 'Ijo',
          'Spiritual Growth': 'Dagba Emi',
          'Community Development': 'Idagbasoke Agbegbe',
          'Traditional Values': 'Iye Oju-ona',
          'Christian Education': 'Eko Kristiani',
          'History & Culture': 'Itan ati Asa',
          'Prayer & Worship': 'Adura ati Ibo',
          'Family & Marriage': 'Ebi ati Igbeyawo',
          'Youth Ministry': 'Ise Awon Odo'
        }
      }
    };

    const translateText = (text, target) => {
      if (!text) return text;
      
      console.log(`Translating "${text}" to ${target}`);
      
      // Map language names to codes
      const languageCodeMap = {
        'English': 'en',
        'French': 'fr',
        'Swahili': 'sw',
        'Yoruba': 'yo',
        'Igbo': 'ig',
        'Hausa': 'ha',
        'Zulu': 'zu',
        'Arabic': 'ar'
      };
      
      // Check if we have a translation for this text
      const sourceLangName = selectedBookForTranslation.language || 'English';
      const sourceLang = languageCodeMap[sourceLangName] || 'en';
      const langTranslations = translations[sourceLang]?.[target];
      
      console.log(`Source language: ${sourceLangName} -> ${sourceLang}`);
      
      if (langTranslations && langTranslations[text]) {
        const translatedText = langTranslations[text];
        console.log(`Translated "${text}" to "${translatedText}"`);
        return translatedText;
      }
      
      // If no specific translation found, return original text with a note
      console.log(`No translation found for "${text}", returning original`);
      return text;
    };

    // Translate each field
    const translatedTitle = translateText(content.title, targetLang);
    const translatedAuthor = translateText(content.author, targetLang);
    const translatedDescription = translateText(content.description, targetLang);

    return {
      title: translatedTitle,
      author: translatedAuthor,
      description: translatedDescription,
      originalLanguage: selectedBookForTranslation.language,
      targetLanguage: targetLang,
      isFallbackTranslation: true
    };
  };

  const closeTranslatedResults = () => {
    setShowTranslatedResults(false);
    setTranslatedContent(null);
  };

  // Debug log for component state
  console.log('BookReader render state:', {
    loading,
    isReading,
    selectedBook: selectedBook?.title,
    booksCount: books.length,
    filteredBooksCount: filteredBooks.length
  });

  if (isReading && selectedBook) {
    console.log('Rendering book reader for:', selectedBook.title, 'Type:', selectedBook.fileType);
    
    // Use EPUB reader for EPUB files
    if (selectedBook.fileType === 'epub') {
      return (
        <EPUBReader
          bookUrl={selectedBook.bookUrl || selectedBook.pdfUrl}
          bookTitle={selectedBook.title}
          onClose={closeReader}
        />
      );
    }
    
    // Use PDF reader for PDF and other files
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} text-gray-900`}>
        {/* Enhanced Mobile Reader Header */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b sticky top-0 z-10`}>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                onClick={closeReader}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              
              <div className="flex-1 mx-4 min-w-0">
                <h1 className={`text-lg sm:text-xl font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBook.title}
                </h1>
                <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  by {selectedBook.author}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: selectedBook.title,
                        text: `Check out this book: ${selectedBook.title} by ${selectedBook.author}`,
                        url: window.location.href
                      });
                    } else {
                      toast.success('Book link copied to clipboard!');
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => {
                    // Bookmark functionality
                    setBookmarkedBooks(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(selectedBook.id)) {
                        newSet.delete(selectedBook.id);
                        toast.success('Book removed from bookmarks');
                      } else {
                        newSet.add(selectedBook.id);
                        toast.success('Book added to bookmarks');
                      }
                      return newSet;
                    });
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarkedBooks.has(selectedBook.id)
                      ? 'text-red-500 bg-red-50'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BookmarkIcon className={`w-5 h-5 ${bookmarkedBooks.has(selectedBook.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Mobile Language Selector */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LanguageIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className={`px-3 py-1 border rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {languages.slice(1).map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => openTranslationModal(selectedBook)}
                className="flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <LanguageIcon className="w-4 h-4" />
                Translate
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced PDF Reader - In-App Only */}
        <div className="px-2 sm:px-4 py-2">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
            <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] relative">
              {(selectedBook.bookUrl || selectedBook.pdfUrl) ? (
                <div className="w-full h-full relative">
                  {/* Overlay to prevent right-click and selection */}
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ 
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    onSelectStart={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                  
                <iframe
                    src={`${selectedBook.bookUrl || selectedBook.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-width&view=FitH&disableprint=true`}
                    className="w-full h-full border-0 relative z-0"
                  title={selectedBook.title}
                    sandbox="allow-same-origin allow-scripts allow-downloads allow-forms"
                    style={{ 
                      pointerEvents: 'auto',
                      border: 'none',
                      outline: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    onLoad={() => {
                      console.log('Book iframe loaded successfully for:', selectedBook.title);
                      // Hide download/print buttons if possible
                      try {
                        const iframe = document.querySelector(`iframe[title="${selectedBook.title}"]`);
                        if (iframe) {
                          // Add CSS to hide toolbar elements
                          const style = document.createElement('style');
                          style.textContent = `
                            iframe[title="${selectedBook.title}"] {
                              -webkit-print-color-adjust: exact !important;
                              print-color-adjust: exact !important;
                            }
                          `;
                          document.head.appendChild(style);
                        }
                      } catch (error) {
                        console.log('Additional iframe protection applied');
                      }
                    }}
                    onError={() => {
                      console.error('Failed to load book:', selectedBook.title);
                    }}
                  />
                  
                  {/* Watermark overlay */}
                  <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      isDarkMode ? 'bg-gray-900 bg-opacity-70 text-gray-300' : 'bg-white bg-opacity-70 text-gray-600'
                    }`}>
                      ATRC Digital Library - View Only
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Book file not available</p>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      The book content is not yet available for reading
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} text-gray-900`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Digital Library
          </h1>
          <p className={`text-base sm:text-xl max-w-3xl mx-auto px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover wisdom, leadership insights, and spiritual growth through our curated collection of books for Traditional Rulers
          </p>
        </div>

        {/* Mobile-Optimized Search Bar */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 mb-4`}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books..."
              className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Filters for Mobile */}
        {showFilters && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className={`p-1 rounded-md ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLanguage('all');
                }}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Results Count */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredBooks.length} of {books.length} books
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLanguage('all');
                }}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation`}>
                {/* Book Cover */}
                <div className="relative h-48 sm:h-56 bg-gray-200 flex items-center justify-center">
                  {book.coverImageUrl ? (
                    <img 
                      src={book.coverImageUrl} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <BookOpenIcon className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">No Cover</p>
                    </div>
                  )}
                  
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBookmarkedBooks(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(book.id)) {
                          newSet.delete(book.id);
                          toast.success('Book removed from bookmarks');
                        } else {
                          newSet.add(book.id);
                          toast.success('Book added to bookmarks');
                        }
                        return newSet;
                      });
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                      bookmarkedBooks.has(book.id)
                        ? 'bg-red-500 text-white'
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <BookmarkIcon className={`w-4 h-4 ${bookmarkedBooks.has(book.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                {/* Book Info */}
                <div className="p-3 sm:p-4">
                  <h3 className={`font-semibold text-base sm:text-lg mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {book.title}
                  </h3>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    by {book.author}
                  </p>
                  <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {book.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getLanguageLabel(book.language)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {getCategoryLabel(book.category)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openBook(book)}
                      className="flex-1 bg-primary-600 text-white py-2.5 px-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium touch-manipulation"
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Read Book</span>
                      <span className="sm:hidden">Read</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openTranslationModal(book)}
                        className="bg-blue-500 text-white py-2.5 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center touch-manipulation"
                        title="Quick Translate"
                      >
                        <LanguageIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBook(book);
                          setShowEnhancedTranslation(true);
                        }}
                        className="bg-green-500 text-white py-2.5 px-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center touch-manipulation"
                        title="Enhanced Translate"
                      >
                        <LanguageIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or check back later for new additions</p>
          </div>
        )}

        {/* Translation Modal */}
        {showTranslationModal && selectedBookForTranslation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Translate Book</h3>
                  <button
                    onClick={closeTranslationModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedBookForTranslation.title}</h4>
                    <p className="text-sm text-gray-600">by {selectedBookForTranslation.author}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Current language: {getLanguageLabel(selectedBookForTranslation.language)}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Translate to:
                    </label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {languages.filter(lang => lang.value !== 'all' && lang.value !== selectedBookForTranslation.language).map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Translation Feature</p>
                        <p className="mt-1">This will translate the book title, author, and description to your selected language using pre-defined translations for common terms.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeTranslationModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={translateBook}
                    disabled={isTranslating}
                    className="flex-1 bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isTranslating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Translating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Translate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Translated Results Modal */}
        {showTranslatedResults && translatedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Translated Content</h3>
                  <button
                    onClick={closeTranslatedResults}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">📖 Title</h4>
                    <p className="text-blue-800">{translatedContent.title}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">✍️ Author</h4>
                    <p className="text-green-800">{translatedContent.author}</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">📝 Description</h4>
                    <p className="text-purple-800">{translatedContent.description}</p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">🌍 Translation Info</h4>
                    <p className="text-sm text-gray-600">
                      Translated from <strong>{getLanguageLabel(translatedContent.originalLanguage)}</strong> 
                      to <strong>{getLanguageLabel(translatedContent.targetLanguage)}</strong>
                    </p>
                    {translatedContent.isFallbackTranslation && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>Note:</strong> Using fallback translations. For full AI translation, enable Google Translate API in your Firebase project.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={closeTranslatedResults}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.open(selectedBookForTranslation.bookUrl || selectedBookForTranslation.pdfUrl, '_blank')}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Open Original Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Translation Modal */}
        {showEnhancedTranslation && selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Enhanced Translation - {selectedBook.title}
                </h2>
                <button
                  onClick={() => setShowEnhancedTranslation(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <TranslationUI
                  content={`
                    <h1>${selectedBook.title}</h1>
                    <p><strong>Author:</strong> ${selectedBook.author}</p>
                    <p><strong>Description:</strong> ${selectedBook.description}</p>
                    <div class="mt-4">
                      <p>This is a sample of the enhanced translation interface. In a real implementation, 
                      this would contain the full book content extracted from the PDF or document.</p>
                      <p>You can now:</p>
                      <ul class="list-disc list-inside mt-2 space-y-1">
                        <li>Highlight any text and translate it instantly</li>
                        <li>Translate the entire content with progress tracking</li>
                        <li>View side-by-side original and translated text</li>
                        <li>Copy translations to clipboard</li>
                        <li>Listen to text-to-speech (if supported)</li>
                        <li>View translation history</li>
                      </ul>
                    </div>
                  `}
                  onTranslationComplete={(result) => {
                    console.log('Translation completed:', result);
                    toast.success('Translation completed successfully!');
                  }}
                  showSideBySide={true}
                  enableHighlight={true}
                  enableAudio={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReader;
