import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voiceApi } from '../services/api';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const STEP = { IDLE: 'IDLE', LISTENING: 'LISTENING', CONFIRMING: 'CONFIRMING', SUCCESS: 'SUCCESS', ERROR: 'ERROR' };

const INTENT_METAS = {
  ADD_STOCK: { label: 'Stock In (+)', color: 'var(--success)', icon: '📥' },
  REMOVE_STOCK: { label: 'Stock Out (-)', color: 'var(--danger)', icon: '📤' },
  CHECK_STOCK: { label: 'Check Stock', color: 'var(--info)', icon: '🔍' },
  LOW_STOCK: { label: 'Low Stock Query', color: 'var(--warning)', icon: '⚠️' },
};

const CATEGORIZED_EXAMPLES = [
  { tag: 'Stock In', cmd: 'Rice 5 bags add cheyyi', icon: '📥' },
  { tag: 'Stock Out', cmd: 'Sugar 2 kg ammamu', icon: '📤' },
  { tag: 'Check Stock', cmd: 'Rice entha undi?', icon: '🔍' },
  { tag: 'Alerts', cmd: 'Which products are low?', icon: '⚠️' },
  { tag: 'Stock In', cmd: 'Oil 5 litres vachayi', icon: '📥' },
  { tag: 'Stock Out', cmd: 'Atta 1 packet sold', icon: '📤' },
];

export default function VoiceAssistantPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP.IDLE);
  const [parsed, setParsed] = useState(null);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const {
    isListening,
    transcript,
    displayText,
    error: voiceError,
    isSupported,
    startListening,
    stopListening,
    reset,
  } = useVoiceRecognition();

  const { speak } = useSpeechSynthesis();

  // When speech recognition ends and transcript exists -> auto-parse
  useEffect(() => {
    if (transcript && !isListening && step === STEP.LISTENING) {
      parseCommand(transcript);
    }
  }, [transcript, isListening, step]);

  // Sync step with isListening
  useEffect(() => {
    if (isListening) {
      setStep(STEP.LISTENING);
    }
  }, [isListening]);

  async function parseCommand(text) {
    if (!text || !text.trim()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await voiceApi.parse(text);
      const data = res.data.data;
      setParsed(data);
      if (data.errorCode) {
        setApiError(`${data.responseText || 'Could not understand command.'} Heard: "${text}"`);
        setStep(STEP.ERROR);
        speak(data.responseText);
      } else {
        setStep(STEP.CONFIRMING);
      }
    } catch (e) {
      const serverMessage = e.response?.data?.message;
      setApiError(`${serverMessage || 'Could not connect to server. Check that backend is running.'}${text ? ` (Heard: "${text}")` : ''}`);
      setStep(STEP.ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const textToExecute = transcript || (parsed && parsed.originalText);
      const res = await voiceApi.execute(textToExecute);
      const data = res.data.data;
      setResult(data);
      if (data.errorCode) {
        setApiError(data.responseText || 'Could not execute command.');
        setStep(STEP.ERROR);
        speak(data.responseText);
      } else {
        setStep(STEP.SUCCESS);
        speak(data.responseText || 'Stock updated successfully!');
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not update inventory.';
      setApiError(msg);
      setStep(STEP.ERROR);
      speak(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    reset();
    setParsed(null);
    setResult(null);
    setApiError('');
    setStep(STEP.IDLE);
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
    } else {
      handleReset();
      startListening();
    }
  }

  const intentMeta = parsed?.intent ? INTENT_METAS[parsed.intent] || { label: parsed.intent, color: 'var(--primary)', icon: '⚡' } : null;

  return (
    <div className="voice-page">
      {/* Top Banner / Header */}
      <div className="voice-page-header">
        <div className="voice-header-badges">
          <span className="voice-lang-pill">
            <span className="lang-dot" /> Telugu • English • Mixed
          </span>
          <span className={`voice-state-pill state-${step.toLowerCase()}`}>
            {step === STEP.LISTENING ? '🎙️ Listening' : step === STEP.CONFIRMING ? '⚡ Reviewing' : step === STEP.SUCCESS ? '✓ Updated' : '🟢 Ready'}
          </span>
        </div>
        <h1 className="voice-main-title">Voice Inventory AI</h1>
        <p className="voice-subtitle">
          Speak naturally to add, deduct, or check your store's stock in seconds
        </p>
      </div>

      <div className="voice-body-container">
        {/* ──────────────── STEP 1: IDLE / LISTENING ──────────────── */}
        {(step === STEP.IDLE || step === STEP.LISTENING) && (
          <div className="voice-active-stage">
            {/* Pulsing Mic Interactive Area */}
            <div className="mic-wrapper">
              {isListening && (
                <>
                  <div className="mic-wave-ring ring-1" />
                  <div className="mic-wave-ring ring-2" />
                  <div className="mic-wave-ring ring-3" />
                </>
              )}
              <button
                type="button"
                className={`voice-mic-main ${isListening ? 'is-recording' : ''}`}
                onClick={handleMicClick}
                disabled={!isSupported && !isListening}
                title={isSupported ? (isListening ? 'Tap to stop' : 'Tap to speak') : 'Voice not supported'}
              >
                <div className="mic-icon-inner">
                  {isListening ? (
                    <span className="mic-stop-sq">⏹</span>
                  ) : (
                    <span className="mic-glyph">🎙️</span>
                  )}
                </div>
              </button>
            </div>

            {/* Sound Wave Visualizer Bars */}
            <div className="soundwave-bar-row">
              {[40, 75, 100, 60, 90, 45, 80, 55, 30].map((h, i) => (
                <span
                  key={i}
                  className={`soundwave-bar ${isListening ? 'animating' : ''}`}
                  style={{
                    height: isListening ? `${h}%` : '18%',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>

            {/* Status instructions */}
            <div className="mic-status-label">
              {isListening ? (
                <span className="status-listening-text">
                  Listening to your voice... Speak now
                </span>
              ) : (
                <span className="status-idle-text">
                  Tap the microphone and speak your command
                </span>
              )}
            </div>

            {/* Live Transcription Box */}
            <div className={`transcript-bubble ${isListening ? 'active-border' : ''} ${displayText ? 'has-content' : ''}`}>
              <div className="bubble-header">
                <span className="bubble-tag">LIVE TRANSCRIPT</span>
                {isListening && <span className="rec-blinker">● REC</span>}
              </div>
              <div className="bubble-text">
                {displayText ? (
                  <span className="user-spoken-text">"{displayText}"</span>
                ) : (
                  <span className="empty-hint">
                    "Rice 5 bags add cheyyi" or "Sugar 2 kg ammamu"...
                  </span>
                )}
              </div>
            </div>

            {/* Browser Support & Error banners */}
            {!isSupported && (
              <div className="alert-banner warning">
                <span>⚠️</span>
                <span>Web Speech API is not enabled in this browser. Please use Chrome or Edge for voice support.</span>
              </div>
            )}

            {voiceError && (
              <div className="alert-banner error">
                <span>❌</span>
                <span>{voiceError}</span>
              </div>
            )}

            {/* Example Commands Card */}
            <div className="voice-examples-card">
              <div className="examples-header">
                <div className="examples-title">
                  <span>💡 Try Saying These Commands</span>
                  <span className="examples-sub">Tap any command to test instantly</span>
                </div>
              </div>

              <div className="example-chips-list">
                {CATEGORIZED_EXAMPLES.map((ex, i) => (
                  <button
                    type="button"
                    key={i}
                    className="example-command-chip"
                    onClick={() => {
                      if (!isListening) parseCommand(ex.cmd);
                    }}
                    title="Tap to run this command"
                  >
                    <span className="chip-tag-badge">{ex.tag}</span>
                    <span className="chip-cmd-text">"{ex.cmd}"</span>
                    <span className="chip-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── STEP: LOADING ──────────────── */}
        {loading && (
          <div className="voice-loading-card">
            <div className="spinner-large" />
            <h3 className="voice-loading-title">AI is processing your voice...</h3>
            <p className="voice-loading-sub">Extracting product name, quantity, unit, and action intent</p>
          </div>
        )}

        {/* ──────────────── STEP 2: CONFIRMING ──────────────── */}
        {step === STEP.CONFIRMING && parsed && !loading && (
          <div className="voice-confirm-stage">
            <div className="heard-preview-bar">
              <span className="heard-label">You said:</span>
              <span className="heard-text">"{transcript || parsed.originalText}"</span>
            </div>

            <div className="ai-understanding-card">
              <div className="ai-card-top">
                <span className="ai-badge">🤖 AI UNDERSTANDING</span>
                <span className="intent-badge-pill" style={{ background: `${intentMeta?.color}18`, color: intentMeta?.color, borderColor: intentMeta?.color }}>
                  {intentMeta?.icon} {intentMeta?.label}
                </span>
              </div>

              <div className="ai-parsed-grid">
                {parsed.product && (
                  <div className="parsed-field-card">
                    <span className="parsed-label">Product Name</span>
                    <span className="parsed-val-highlight">{parsed.product}</span>
                  </div>
                )}

                {parsed.quantity != null && (
                  <div className="parsed-field-card">
                    <span className="parsed-label">Quantity & Unit</span>
                    <span className="parsed-val-highlight">{parsed.quantity} {parsed.unit || ''}</span>
                  </div>
                )}
              </div>

              {parsed.responseText && (
                <div className="ai-explanation-box">
                  <span className="ai-quote-icon">💬</span>
                  <span className="ai-quote-text">{parsed.responseText}</span>
                </div>
              )}

              <div className="confirm-buttons-group">
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={handleReset}
                >
                  ✕ Cancel
                </button>
                <button
                  type="button"
                  className="btn-confirm-apply"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  ✓ Confirm & Update Stock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 3: SUCCESS ──────────────── */}
        {step === STEP.SUCCESS && result && !loading && (
          <div className="voice-success-stage">
            <div className="success-celebration-badge">
              <span className="celebrate-icon">🎉</span>
              <h2 className="success-title">Inventory Updated!</h2>
            </div>

            {result.stockUpdate && (
              <div className="success-stock-delta-card">
                <div className="delta-product-name">{result.stockUpdate.product}</div>
                <div className="delta-flow-row">
                  <div className="delta-step">
                    <span className="delta-step-label">Before</span>
                    <span className="delta-step-val">{parseFloat(result.stockUpdate.previousStock).toFixed(1)}</span>
                  </div>

                  <div className={`delta-operator ${result.stockUpdate.operation === 'ADD' ? 'is-add' : 'is-remove'}`}>
                    <span className="delta-op-symbol">
                      {result.stockUpdate.operation === 'ADD' ? '+ ' : '- '}
                      {parseFloat(result.stockUpdate.quantity).toFixed(1)} {result.stockUpdate.unit}
                    </span>
                    <span className="delta-op-arrow">→</span>
                  </div>

                  <div className="delta-step step-new">
                    <span className="delta-step-label">New Stock</span>
                    <span className="delta-step-val val-bold">{parseFloat(result.stockUpdate.newStock).toFixed(1)}</span>
                  </div>
                </div>

                {result.stockUpdate?.lowStock && (
                  <div className="alert-banner warning" style={{ marginTop: 14 }}>
                    <span>⚠️</span>
                    <span>Notice: {result.stockUpdate.product} is now at or below minimum threshold!</span>
                  </div>
                )}
              </div>
            )}

            {/* AI voice feedback text */}
            {result.responseText && (
              <div className="voice-tts-quote">
                <span className="tts-speaker">🔊</span>
                <span className="tts-text">"{result.responseText}"</span>
              </div>
            )}

            <div className="success-nav-actions">
              <button
                type="button"
                className="btn-again-speak"
                onClick={handleReset}
              >
                🎙️ Speak Another Command
              </button>
              <button
                type="button"
                className="btn-view-dash"
                onClick={() => navigate('/dashboard')}
              >
                📊 Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 4: ERROR ──────────────── */}
        {step === STEP.ERROR && !loading && (
          <div className="voice-error-stage">
            <div className="error-icon-large">🤔</div>
            <h3 className="error-headline">Could Not Process Command</h3>
            <div className="alert-banner error" style={{ textAlign: 'left', marginTop: 12 }}>
              <span>⚠️</span>
              <span>{apiError || voiceError || 'Something went wrong. Please speak clearly and try again.'}</span>
            </div>

            <div className="error-suggestion-box">
              <div className="sugg-title">Tips for best voice recognition:</div>
              <ul>
                <li>Mention the item name clearly (e.g. <em>"Rice"</em>, <em>"Sugar"</em>)</li>
                <li>State the quantity and unit (e.g. <em>"5 kg"</em>, <em>"2 packets"</em>)</li>
                <li>State the action (e.g. <em>"add cheyyi"</em>, <em>"ammamamu"</em>, or <em>"add"</em> / <em>"sold"</em>)</li>
              </ul>
            </div>

            <button
              type="button"
              className="btn-retry-modern"
              onClick={handleReset}
            >
              🎙️ Try Speaking Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
