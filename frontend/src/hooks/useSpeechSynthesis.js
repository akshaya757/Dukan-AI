import { useCallback, useEffect, useRef } from 'react';

/**
 * useSpeechSynthesis — wraps Web Speech Synthesis API for TTS responses
 * Fixes async voice loading: voices are populated asynchronously in browsers.
 */
export function useSpeechSynthesis() {
  const isSupported = 'speechSynthesis' in window;
  const voicesRef = useRef([]);

  // Load voices — browsers fire voiceschanged when ready
  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices(); // try immediately (works in Firefox)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [isSupported]);

  const speak = useCallback((text, lang = 'en-IN') => {
    if (!isSupported || !text) return;
    window.speechSynthesis.cancel(); // stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    const hasTeluguText = /[\u0C00-\u0C7F]/.test(text);
    const speechLang = hasTeluguText ? 'te-IN' : lang;
    utterance.lang = speechLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use a voice matching the text language. A Telugu voice cannot pronounce
    // the English responses returned by the backend clearly.
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : window.speechSynthesis.getVoices(); // fallback
    const normalizedLang = speechLang.toLowerCase();
    const preferred = voices.find(v => v.lang.toLowerCase() === normalizedLang) ||
                      voices.find(v => v.lang.toLowerCase().startsWith(normalizedLang.split('-')[0])) ||
                      (hasTeluguText ? null : voices.find(v => v.lang.toLowerCase().startsWith('en')));
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel();
  }, [isSupported]);

  return { speak, cancel, isSupported };
}
