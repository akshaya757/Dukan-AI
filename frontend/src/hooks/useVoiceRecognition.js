import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useVoiceRecognition — wraps Web Speech API for Telugu+English recognition
 */
export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const languageFallbackRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      // en-IN reliably transcribes mixed Telugu-English commands into text
      // the backend parser can understand across Chrome and Edge.
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          // Pick the best alternative (highest confidence)
          let best = event.results[i][0].transcript;
          for (let j = 1; j < event.results[i].length; j++) {
            if (event.results[i][j].confidence > event.results[i][0].confidence) {
              best = event.results[i][j].transcript;
            }
          }
          if (event.results[i].isFinal) final += best;
          else interim += best;
        }
        setInterimTranscript(interim);
        if (final) {
          setTranscript(final.trim());
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event) => {
        const msgs = {
          'not-allowed': 'Microphone access denied. Please allow microphone permission.',
          'no-speech': 'No speech detected. Please try again.',
          'network': 'Network error. Check your internet connection.',
          'audio-capture': 'No microphone found.',
          'language-not-supported': 'Speech language is not supported. Please try again.',
        };
        // Keep a Telugu fallback for browsers that do not provide Indian English.
        if (event.error === 'language-not-supported' && !languageFallbackRef.current) {
          languageFallbackRef.current = true;
          recognition.lang = 'te-IN';
          window.setTimeout(() => {
            try {
              recognition.start();
              setIsListening(true);
            } catch (e) {
              setError('Could not start voice recognition. Please try again.');
              setIsListening(false);
            }
          }, 0);
          return;
        }
        setError(msgs[event.error] || `Voice error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    languageFallbackRef.current = false;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setError('Could not start voice recognition. Please try again.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    displayText: isListening ? interimTranscript || transcript : transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
