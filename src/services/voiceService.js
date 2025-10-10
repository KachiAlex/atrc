/**
 * Voice Service
 * Handles speech-to-text (voice input) and text-to-speech (voice output)
 * Uses Web Speech API (built into modern browsers)
 */

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.voicesList = [];
    
    this.initRecognition();
    this.loadVoices();
  }

  /**
   * Initialize Speech Recognition
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Default language
    this.recognition.maxAlternatives = 1;
  }

  /**
   * Load available voices for text-to-speech
   */
  loadVoices() {
    if (!this.synthesis) return;

    const loadVoicesList = () => {
      this.voicesList = this.synthesis.getVoices();
    };

    loadVoicesList();
    
    // Chrome loads voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoicesList;
    }
  }

  /**
   * Get best voice for language
   */
  getBestVoice(language = 'en-US') {
    if (!this.voicesList.length) {
      this.loadVoices();
    }

    // Try to find a voice matching the language
    let voice = this.voicesList.find(v => v.lang === language);
    
    // Fallback to any English voice
    if (!voice) {
      voice = this.voicesList.find(v => v.lang.startsWith('en'));
    }
    
    // Fallback to default voice
    if (!voice) {
      voice = this.voicesList[0];
    }

    return voice;
  }

  /**
   * Check if speech recognition is supported
   */
  isRecognitionSupported() {
    return !!this.recognition;
  }

  /**
   * Check if speech synthesis is supported
   */
  isSynthesisSupported() {
    return !!this.synthesis;
  }

  /**
   * Start listening for voice input
   * @param {Function} onResult - Callback for interim and final results
   * @param {Function} onError - Callback for errors
   * @param {Function} onEnd - Callback when listening ends
   */
  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported'));
      return;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.isListening = true;

    this.recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      onResult({
        interim: interimTranscript,
        final: finalTranscript.trim(),
        isFinal: finalTranscript.length > 0
      });
    };

    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      this.isListening = false;
      onError(error);
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Speak text using text-to-speech
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options (rate, pitch, volume, lang)
   * @param {Function} onEnd - Callback when speech ends
   */
  speak(text, options = {}, onEnd) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || 1.0; // 0.1 to 10
    utterance.pitch = options.pitch || 1.0; // 0 to 2
    utterance.volume = options.volume || 1.0; // 0 to 1
    utterance.lang = options.lang || 'en-US';

    // Get best voice
    const voice = this.getBestVoice(utterance.lang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('Speech started');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('Speech ended');
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Toggle speaking on/off
   */
  toggleSpeaking() {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }
  }

  /**
   * Pause speaking
   */
  pauseSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume speaking
   */
  resumeSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.resume();
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      recognitionSupported: this.isRecognitionSupported(),
      synthesisSupported: this.isSynthesisSupported(),
      availableVoices: this.voicesList.length
    };
  }

  /**
   * Change recognition language
   */
  setRecognitionLanguage(language) {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }
}

// Export singleton instance
const voiceService = new VoiceService();
export default voiceService;

