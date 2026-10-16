import { api } from '../api/client';

/**
 * Translation Service
 * All translation goes through the self-hosted backend (POST /api/translate),
 * which uses Groq (primary) or Google Cloud Translation (fallback) server-side,
 * with a Postgres cache. No API keys are shipped to the browser.
 */

// The reader offers any of these target languages.
export const SUPPORTED_LANGUAGES = [
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
  { code: 'xh', name: 'Xhosa' },
  { code: 'am', name: 'Amharic' },
  { code: 'om', name: 'Oromo' },
  { code: 'so', name: 'Somali' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'lg', name: 'Luganda' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'sn', name: 'Shona' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Tswana' },
  { code: 'ts', name: 'Tsonga' },
  { code: 'ee', name: 'Ewe' },
  { code: 'tw', name: 'Twi' },
  { code: 'ff', name: 'Fulani' },
  { code: 'wo', name: 'Wolof' },
  { code: 'bm', name: 'Bambara' },
  { code: 'ln', name: 'Lingala' },
  { code: 'kg', name: 'Kongo' },
  { code: 'lua', name: 'Luba-Katanga' },
  { code: 'pcm', name: 'Nigerian Pidgin' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
];

/**
 * Translate text via the backend translation endpoint.
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (e.g., 'fr', 'yo')
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
    const res = await api('/translate', {
      method: 'POST',
      body: { q: text, source: sourceLanguage, target: targetLanguage }
    });
    if (res && res.translatedText) return res.translatedText;
    throw new Error('Invalid response from translation API');
  } catch (error) {
    console.error('Translation API error:', error);
    // Last resort: static dictionary (covers a few African languages)
    return translateWithStatic(text, targetLanguage);
  }
};

/**
 * Batch translate multiple texts — single backend call.
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
    const res = await api('/translate', {
      method: 'POST',
      body: { texts, source: sourceLanguage, target: targetLanguage }
    });
    if (res && Array.isArray(res.translations)) {
      return res.translations.map((t, i) => t || texts[i]);
    }
    throw new Error('Invalid response from translation API');
  } catch (error) {
    console.error('Batch translation error:', error);
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
    const res = await api('/translate', {
      method: 'POST',
      body: { detect: text }
    });
    return (res && res.language) || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
};

/**
 * Enhanced static translation with better word matching
 * Fallback when the backend is unavailable
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
  return getDefaultLanguages();
};

/**
 * Get default language list
 */
const getDefaultLanguages = () => {
  return SUPPORTED_LANGUAGES;
};

const translationService = {
  translateWithGoogle,
  batchTranslate,
  detectLanguage,
  translateWithStatic,
  getSupportedLanguages,
  getDefaultLanguages,
  SUPPORTED_LANGUAGES
};

export default translationService;
