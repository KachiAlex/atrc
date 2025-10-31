import axios from 'axios';
import { collection, doc, getDoc, setDoc, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Enhanced Translation Service with Chunking and Caching
 * Implements ChatGPT's recommendations for handling large eBooks
 */

const GOOGLE_TRANSLATE_API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// Configuration
const CHUNK_SIZE = 1000; // Characters per chunk
const MAX_RETRIES = 3;
const CACHE_EXPIRY_HOURS = 24;

/**
 * Text chunking utility
 * Splits text into manageable chunks for API processing
 */
export const chunkText = (text, chunkSize = CHUNK_SIZE) => {
  if (!text || text.length <= chunkSize) {
    return [text];
  }

  const chunks = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= chunkSize) {
      currentChunk += sentence + '.';
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence + '.';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 0);
};

/**
 * Generate cache key for translation
 */
const generateCacheKey = (text, targetLang, sourceLang = 'en') => {
  const textHash = btoa(text).replace(/[^a-zA-Z0-9]/g, '');
  return `${textHash}_${sourceLang}_${targetLang}`;
};

/**
 * Check if cached translation exists and is still valid
 */
const getCachedTranslation = async (cacheKey) => {
  try {
    const cacheRef = doc(db, 'translations', cacheKey);
    const cacheDoc = await getDoc(cacheRef);
    
    if (cacheDoc.exists()) {
      const data = cacheDoc.data();
      const now = new Date();
      const cacheTime = data.timestamp.toDate();
      const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
      
      if (hoursDiff < CACHE_EXPIRY_HOURS) {
        return data.translatedText;
      }
    }
  } catch (error) {
    console.warn('Error checking cache:', error);
  }
  
  return null;
};

/**
 * Store translation in cache
 */
const setCachedTranslation = async (cacheKey, translatedText, originalText, targetLang, sourceLang) => {
  try {
    const cacheRef = doc(db, 'translations', cacheKey);
    await setDoc(cacheRef, {
      translatedText,
      originalText,
      targetLang,
      sourceLang,
      timestamp: new Date(),
      chunkCount: Array.isArray(translatedText) ? translatedText.length : 1
    });
  } catch (error) {
    console.warn('Error caching translation:', error);
  }
};

/**
 * Translate text using Google Cloud Translation API with retry logic
 */
const translateWithGoogleAPI = async (text, targetLang, sourceLang = 'en', retryCount = 0) => {
  if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY_HERE') {
    throw new Error('Google Translate API key not configured');
  }

  try {
    const response = await axios.post(
      GOOGLE_TRANSLATE_API_URL,
      null,
      {
        params: {
          q: text,
          target: targetLang,
          source: sourceLang,
          format: 'text',
          key: GOOGLE_TRANSLATE_API_KEY
        },
        timeout: 10000 // 10 second timeout
      }
    );

    if (response.data?.data?.translations?.[0]?.translatedText) {
      return response.data.data.translations[0].translatedText;
    }

    throw new Error('Invalid response from Google Translate API');
  } catch (error) {
    if (retryCount < MAX_RETRIES && error.code !== 'ECONNABORTED') {
      console.warn(`Translation attempt ${retryCount + 1} failed, retrying...`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return translateWithGoogleAPI(text, targetLang, sourceLang, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Enhanced translation with chunking and caching
 */
export const translateText = async (text, targetLang, sourceLang = 'en', options = {}) => {
  const { useCache = true, chunkSize = CHUNK_SIZE } = options;
  
  if (!text || !text.trim()) {
    return text;
  }

  // Skip if translating to the same language
  if (targetLang === sourceLang) {
    return text;
  }

  // Check cache first
  if (useCache) {
    const cacheKey = generateCacheKey(text, targetLang, sourceLang);
    const cached = await getCachedTranslation(cacheKey);
    if (cached) {
      console.log('Using cached translation');
      return cached;
    }
  }

  try {
    // Chunk the text if it's too large
    const chunks = chunkText(text, chunkSize);
    
    if (chunks.length === 1) {
      // Single chunk - direct translation
      const translatedText = await translateWithGoogleAPI(text, targetLang, sourceLang);
      
      // Cache the result
      if (useCache) {
        const cacheKey = generateCacheKey(text, targetLang, sourceLang);
        await setCachedTranslation(cacheKey, translatedText, text, targetLang, sourceLang);
      }
      
      return translatedText;
    } else {
      // Multiple chunks - translate each and combine
      console.log(`Translating ${chunks.length} chunks...`);
      
      const translatedChunks = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Translating chunk ${i + 1}/${chunks.length}`);
        
        const chunkCacheKey = generateCacheKey(chunks[i], targetLang, sourceLang);
        let translatedChunk = useCache ? await getCachedTranslation(chunkCacheKey) : null;
        
        if (!translatedChunk) {
          translatedChunk = await translateWithGoogleAPI(chunks[i], targetLang, sourceLang);
          
          // Cache individual chunk
          if (useCache) {
            await setCachedTranslation(chunkCacheKey, translatedChunk, chunks[i], targetLang, sourceLang);
          }
        }
        
        translatedChunks.push(translatedChunk);
        
        // Small delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      const finalTranslation = translatedChunks.join(' ');
      
      // Cache the complete translation
      if (useCache) {
        const cacheKey = generateCacheKey(text, targetLang, sourceLang);
        await setCachedTranslation(cacheKey, finalTranslation, text, targetLang, sourceLang);
      }
      
      return finalTranslation;
    }
  } catch (error) {
    console.error('Translation failed:', error);
    
    // Fallback to static translations
    return translateWithStatic(text, targetLang);
  }
};

/**
 * Batch translate multiple texts with caching
 */
export const batchTranslateTexts = async (texts, targetLang, sourceLang = 'en', options = {}) => {
  const { useCache = true, maxConcurrent = 3 } = options;
  
  if (!texts || texts.length === 0) {
    return [];
  }

  const results = [];
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < texts.length; i += maxConcurrent) {
    const batch = texts.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(text => translateText(text, targetLang, sourceLang, options));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(`Batch translation failed for batch ${i / maxConcurrent + 1}:`, error);
      // Add fallback translations for failed batch
      const fallbackResults = batch.map(text => translateWithStatic(text, targetLang));
      results.push(...fallbackResults);
    }
    
    // Delay between batches
    if (i + maxConcurrent < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};

/**
 * Translate book content with progress tracking
 */
export const translateBookContent = async (bookContent, targetLang, sourceLang = 'en', onProgress = null) => {
  const { title, author, description, chapters = [] } = bookContent;
  
  const totalItems = 3 + chapters.length; // title, author, description + chapters
  let completed = 0;
  
  const updateProgress = () => {
    completed++;
    if (onProgress) {
      onProgress({
        completed,
        total: totalItems,
        percentage: Math.round((completed / totalItems) * 100),
        currentItem: completed === 1 ? 'Title' : 
                    completed === 2 ? 'Author' : 
                    completed === 3 ? 'Description' : 
                    `Chapter ${completed - 3}`
      });
    }
  };

  try {
    // Translate metadata
    const [translatedTitle, translatedAuthor, translatedDescription] = await Promise.all([
      translateText(title, targetLang, sourceLang),
      translateText(author, targetLang, sourceLang),
      translateText(description, targetLang, sourceLang)
    ]);
    
    completed += 3;
    updateProgress();

    // Translate chapters
    const translatedChapters = [];
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const translatedChapter = {
        ...chapter,
        title: await translateText(chapter.title, targetLang, sourceLang),
        content: await translateText(chapter.content, targetLang, sourceLang)
      };
      translatedChapters.push(translatedChapter);
      updateProgress();
    }

    return {
      title: translatedTitle,
      author: translatedAuthor,
      description: translatedDescription,
      chapters: translatedChapters,
      originalLanguage: sourceLang,
      targetLanguage: targetLang,
      translatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Book translation failed:', error);
    throw error;
  }
};

/**
 * Get translation statistics
 */
export const getTranslationStats = async () => {
  try {
    const translationsRef = collection(db, 'translations');
    const snapshot = await getDocs(translationsRef);
    
    const stats = {
      totalTranslations: snapshot.size,
      languages: {},
      recentTranslations: []
    };
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Count by language
      if (data.targetLang) {
        stats.languages[data.targetLang] = (stats.languages[data.targetLang] || 0) + 1;
      }
      
      // Recent translations
      if (data.timestamp && data.timestamp.toDate() > oneDayAgo) {
        stats.recentTranslations.push({
          id: doc.id,
          targetLang: data.targetLang,
          timestamp: data.timestamp.toDate(),
          textLength: data.originalText?.length || 0
        });
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting translation stats:', error);
    return { totalTranslations: 0, languages: {}, recentTranslations: [] };
  }
};

/**
 * Clear old translations from cache
 */
export const clearOldTranslations = async (olderThanHours = CACHE_EXPIRY_HOURS * 2) => {
  try {
    const translationsRef = collection(db, 'translations');
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    const q = query(
      translationsRef,
      where('timestamp', '<', cutoffTime)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = [];
    
    snapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    console.log(`Cleared ${snapshot.size} old translations`);
    
    return snapshot.size;
  } catch (error) {
    console.error('Error clearing old translations:', error);
    return 0;
  }
};

/**
 * Static translation fallback (from existing service)
 */
const translateWithStatic = (text, targetLang) => {
  const translations = getStaticTranslations(targetLang);
  if (!translations) return text;

  let translatedText = text;
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translatedText = translatedText.replace(regex, translations[word]);
  });

  return translatedText;
};

const getStaticTranslations = (targetLang) => {
  const comprehensiveTranslations = {
    'yo': {
      'Leadership': 'Asiwaju', 'Traditional': 'Aṣa', 'Ruler': 'Ọba', 'King': 'Ọba',
      'Chief': 'Olori', 'Elder': 'Agba', 'Wisdom': 'Ọgbọn', 'Community': 'Agbegbe',
      'Kingdom': 'Ijọba', 'Authority': 'Aṣẹ', 'Power': 'Agbara', 'Respect': 'Ọwọ',
      'Honor': 'Ọla', 'Tradition': 'Aṣa', 'Culture': 'Aṣa', 'Heritage': 'Ogún',
      'Ancestor': 'Baba-nla', 'Blessing': 'Ibukun', 'Prayer': 'Adura', 'God': 'Ọlọrun',
      'Christ': 'Kristi', 'Christian': 'Onigbagbọ', 'Faith': 'Igbagbọ', 'Church': 'Ijọ',
      'Pastor': 'Pastọ', 'Bible': 'Bibeli', 'Scripture': 'Mimọ', 'Gospel': 'Ihinrere',
      'Salvation': 'Igbala', 'Grace': 'Ore-ọfẹ', 'Love': 'Ifẹ', 'Peace': 'Alaafia',
      'Joy': 'Ayọ', 'Hope': 'Ireti', 'Truth': 'Otitọ', 'Justice': 'Ododo',
      'Book': 'Iwe', 'Chapter': 'Ori', 'Page': 'Oju-iwe', 'Word': 'Ọrọ',
      'Language': 'Ede', 'Translation': 'Itumọ', 'Meaning': 'Itumọ'
    },
    'ig': {
      'Leadership': 'Nduzi', 'Traditional': 'Omenala', 'Ruler': 'Eze', 'King': 'Eze',
      'Chief': 'Ichie', 'Elder': 'Ndi-ichie', 'Wisdom': 'Amamihe', 'Community': 'Obodo',
      'Kingdom': 'Alaeze', 'Authority': 'Ikike', 'Power': 'Ike', 'Respect': 'Nkwanye ugwu',
      'Honor': 'Nsọpụrụ', 'Tradition': 'Omenala', 'Culture': 'Omenala', 'Heritage': 'Ihe nketa',
      'Ancestor': 'Ndi-ichie', 'Blessing': 'Ngọzi', 'Prayer': 'Ekpere', 'God': 'Chineke',
      'Christ': 'Kraịst', 'Christian': 'Onye Kraịst', 'Faith': 'Okwukwe', 'Church': 'Ụka',
      'Pastor': 'Onye-nkuzi', 'Bible': 'Akwụkwọ Nsọ', 'Gospel': 'Oziọma', 'Salvation': 'Nzọpụta',
      'Grace': 'Amara', 'Love': 'Ịhụnanya', 'Peace': 'Udo', 'Joy': 'Ọṅụ', 'Hope': 'Olileanya',
      'Book': 'Akwụkwọ', 'Chapter': 'Isi', 'Page': 'Peeji', 'Word': 'Okwu',
      'Language': 'Asụsụ', 'Translation': 'Ntụghari'
    },
    'ha': {
      'Leadership': 'Jagoranci', 'Traditional': 'Al\'ada', 'Ruler': 'Sarki', 'King': 'Sarki',
      'Chief': 'Hakimi', 'Elder': 'Dattijo', 'Wisdom': 'Hikima', 'Community': 'Al\'umma',
      'Kingdom': 'Daula', 'Authority': 'Iko', 'Power': 'Iko', 'Respect': 'Girmamawa',
      'Honor': 'Daraja', 'Tradition': 'Al\'ada', 'Culture': 'Al\'ada', 'Heritage': 'Gado',
      'Ancestor': 'Kakanni', 'Blessing': 'Albarka', 'Prayer': 'Addu\'a', 'God': 'Allah',
      'Christ': 'Almasihu', 'Christian': 'Kirista', 'Faith': 'Bangaskiya', 'Church': 'Coci',
      'Pastor': 'Fasto', 'Bible': 'Littafi Mai Tsarki', 'Gospel': 'Bishara', 'Salvation': 'Ceto',
      'Grace': 'Alheri', 'Love': 'Ƙauna', 'Peace': 'Salama', 'Joy': 'Farin ciki', 'Hope': 'Bege',
      'Book': 'Littafi', 'Chapter': 'Babi', 'Page': 'Shafi', 'Word': 'Kalma',
      'Language': 'Harshe', 'Translation': 'Fassara'
    },
    'sw': {
      'Leadership': 'Uongozi', 'Traditional': 'Jadi', 'Ruler': 'Mtawala', 'King': 'Mfalme',
      'Chief': 'Mkuu', 'Elder': 'Mzee', 'Wisdom': 'Hekima', 'Community': 'Jamii',
      'Kingdom': 'Ufalme', 'Authority': 'Mamlaka', 'Power': 'Nguvu', 'Respect': 'Heshima',
      'Honor': 'Heshima', 'Tradition': 'Jadi', 'Culture': 'Utamaduni', 'Heritage': 'Urithi',
      'Ancestor': 'Babu', 'Blessing': 'Baraka', 'Prayer': 'Sala', 'God': 'Mungu',
      'Christ': 'Kristo', 'Christian': 'Mkristo', 'Faith': 'Imani', 'Church': 'Kanisa',
      'Pastor': 'Mchungaji', 'Bible': 'Biblia', 'Gospel': 'Injili', 'Salvation': 'Wokovu',
      'Grace': 'Neema', 'Love': 'Upendo', 'Peace': 'Amani', 'Joy': 'Furaha', 'Hope': 'Tumaini',
      'Book': 'Kitabu', 'Chapter': 'Sura', 'Page': 'Ukurasa', 'Word': 'Neno',
      'Language': 'Lugha', 'Translation': 'Tafsiri'
    }
  };

  return comprehensiveTranslations[targetLang] || null;
};

export default {
  translateText,
  batchTranslateTexts,
  translateBookContent,
  chunkText,
  getTranslationStats,
  clearOldTranslations
};
