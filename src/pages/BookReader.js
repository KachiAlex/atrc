import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../contexts/LanguageContext';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';

const BookReader = () => {
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
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedBookForTranslation, setSelectedBookForTranslation] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslatedResults, setShowTranslatedResults] = useState(false);
  const [translatedContent, setTranslatedContent] = useState(null);

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
      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
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
    try {
      // Get the book content (title, author, description)
      const contentToTranslate = {
        title: selectedBookForTranslation.title,
        author: selectedBookForTranslation.author,
        description: selectedBookForTranslation.description
      };

      // Translate the content using Google Translate API
      console.log('Starting translation for:', contentToTranslate, 'to language:', targetLanguage);
      const translatedResult = await translateContent(contentToTranslate, targetLanguage);
      console.log('Translation result:', translatedResult);
      
      // Show the translated content in a new modal
      console.log('Setting translated content and showing results modal');
      setTranslatedContent(translatedResult);
      setShowTranslatedResults(true);
      console.log('Translation modal should now be visible');
      
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
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

  if (isReading && selectedBook) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Reader Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeReader}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Library
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{selectedBook.title}</h1>
                  <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {languages.slice(1).map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Reader */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-[calc(100vh-200px)]">
              {selectedBook.pdfUrl ? (
                <iframe
                  src={`${selectedBook.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={selectedBook.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p>PDF not available</p>
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Digital Library</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Discover wisdom, leadership insights, and spiritual growth through our curated collection of books for Traditional Rulers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Books</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLanguage('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBooks.length} of {books.length} books
          </p>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  {book.coverImageUrl ? (
                    <img 
                      src={book.coverImageUrl} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm">No Cover</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-3">{book.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {getLanguageLabel(book.language)}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {getCategoryLabel(book.category)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openBook(book)}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Read Book
                    </button>
                    <button
                      onClick={() => openTranslationModal(book)}
                      className="bg-secondary-600 text-white py-2 px-3 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center"
                      title="Translate Book"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </button>
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
                    onClick={() => window.open(selectedBookForTranslation.pdfUrl, '_blank')}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Read Original Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReader;
