import axios from 'axios';

/**
 * Google Cloud Translation Service
 * Provides real-time translation using Google Cloud Translation API v2
 */

const GOOGLE_TRANSLATE_API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// Fallback translation service
const FALLBACK_TRANSLATE_API_URL = process.env.REACT_APP_TRANSLATE_API_URL || '';
const FALLBACK_TRANSLATE_API_KEY = process.env.REACT_APP_TRANSLATE_API_KEY || '';

/**
 * Translate text using Google Cloud Translation API
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'es', 'fr', 'yo')
 * @param {string} sourceLanguage - Source language code (default: 'en')
 * @returns {Promise<string>} Translated text
 */
export const translateWithGoogle = async (text, targetLanguage, sourceLanguage = 'en') => {
  if (!text || !text.trim()) {
    return text;
  }

  // Skip if translating to the same language
  if (targetLanguage === sourceLanguage) {
    return text;
  }

  try {
    // Check if API key is configured
    if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY_HERE') {
      console.warn('Google Translate API key not configured. Using fallback.');
      throw new Error('API key not configured');
    }

    const response = await axios.post(
      GOOGLE_TRANSLATE_API_URL,
      null,
      {
        params: {
          q: text,
          target: targetLanguage,
          source: sourceLanguage,
          format: 'text',
          key: GOOGLE_TRANSLATE_API_KEY
        }
      }
    );

    if (response.data && response.data.data && response.data.data.translations) {
      return response.data.data.translations[0].translatedText;
    }

    throw new Error('Invalid response from Google Translate API');
  } catch (error) {
    console.error('Google Translate API error:', error);
    
    // Try fallback translation service
    if (FALLBACK_TRANSLATE_API_URL) {
      try {
        const fallbackResult = await translateWithFallbackService(text, targetLanguage, sourceLanguage);
        if (fallbackResult) return fallbackResult;
      } catch (fallbackError) {
        console.warn('Fallback translation also failed:', fallbackError);
      }
    }
    
    // Last resort: use static translations
    return translateWithStatic(text, targetLanguage);
  }
};

/**
 * Translate text using a fallback translation service (e.g., LibreTranslate)
 */
const translateWithFallbackService = async (text, targetLanguage, sourceLanguage = 'en') => {
  try {
    const payload = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    };

    const response = await axios.post(
      FALLBACK_TRANSLATE_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(FALLBACK_TRANSLATE_API_KEY ? { 'Authorization': `Bearer ${FALLBACK_TRANSLATE_API_KEY}` } : {})
        }
      }
    );

    if (response.data && response.data.translatedText) {
      return response.data.translatedText;
    }

    if (Array.isArray(response.data) && response.data[0] && response.data[0].translatedText) {
      return response.data[0].translatedText;
    }

    return null;
  } catch (error) {
    console.warn('Fallback translation service failed:', error);
    return null;
  }
};

/**
 * Batch translate multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code
 * @returns {Promise<string[]>} Array of translated texts
 */
export const batchTranslate = async (texts, targetLanguage, sourceLanguage = 'en') => {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY_HERE') {
      throw new Error('API key not configured');
    }

    const response = await axios.post(
      GOOGLE_TRANSLATE_API_URL,
      null,
      {
        params: {
          q: texts,
          target: targetLanguage,
          source: sourceLanguage,
          format: 'text',
          key: GOOGLE_TRANSLATE_API_KEY
        }
      }
    );

    if (response.data && response.data.data && response.data.data.translations) {
      return response.data.data.translations.map(t => t.translatedText);
    }

    throw new Error('Invalid response from Google Translate API');
  } catch (error) {
    console.error('Batch translation error:', error);
    // Fallback to individual static translations
    return texts.map(text => translateWithStatic(text, targetLanguage));
  }
};

/**
 * Detect language of given text
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} Detected language code
 */
export const detectLanguage = async (text) => {
  try {
    if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY_HERE') {
      return 'en'; // Default to English
    }

    const response = await axios.post(
      'https://translation.googleapis.com/language/translate/v2/detect',
      null,
      {
        params: {
          q: text,
          key: GOOGLE_TRANSLATE_API_KEY
        }
      }
    );

    if (response.data && response.data.data && response.data.data.detections) {
      return response.data.data.detections[0][0].language;
    }

    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
};

/**
 * Enhanced static translation with better word matching
 * Fallback when API is unavailable
 */
export const translateWithStatic = (text, targetLang) => {
  const translations = getStaticTranslations(targetLang);
  if (!translations) return text;

  let translatedText = text;
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translatedText = translatedText.replace(regex, translations[word]);
  });

  return translatedText;
};

/**
 * Get static translations for a language
 * Comprehensive dictionary for African languages
 */
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

/**
 * Get list of supported languages
 */
export const getSupportedLanguages = async () => {
  try {
    if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY_HERE') {
      return getDefaultLanguages();
    }

    const response = await axios.get(
      'https://translation.googleapis.com/language/translate/v2/languages',
      {
        params: {
          key: GOOGLE_TRANSLATE_API_KEY,
          target: 'en'
        }
      }
    );

    if (response.data && response.data.data && response.data.data.languages) {
      return response.data.data.languages;
    }

    return getDefaultLanguages();
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return getDefaultLanguages();
  }
};

/**
 * Get default language list
 */
const getDefaultLanguages = () => {
  return [
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
};

export default {
  translateWithGoogle,
  batchTranslate,
  detectLanguage,
  translateWithStatic,
  getSupportedLanguages,
  getDefaultLanguages
};

