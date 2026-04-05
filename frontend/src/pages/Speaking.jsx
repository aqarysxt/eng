import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayLesson, submitSpeaking } from '../services/api';
import AudioRecorder from '../components/AudioRecorder';

export default function Speaking() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getTodayLesson();
        setLesson(res.data.lesson);
        setCurrentDay(res.data.currentDay);
      } catch (err) {
        console.error('Failed to load speaking:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRecordingComplete = (blob) => {
    setAudioBlob(blob);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    setSubmitting(true);
    try {
      const res = await submitSpeaking(audioBlob, currentDay);
      setResult(res.data);
    } catch (err) {
      console.error('Failed to submit speaking:', err);
      setResult({ error: 'Failed to process your speech. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader__spinner" />
        <p>Loading speaking exercise...</p>
      </div>
    );
  }

  // Get first 2 sentences of the listening text as the prompt
  const listeningText = lesson?.listening_text || '';
  const speakingPrompt = listeningText.split('.').slice(0, 2).join('.').trim() + '.';

  return (
    <div className="speaking">
      {/* Header */}
      <header className="page-header animate-fade-in">
        <button className="page-header__back" onClick={() => navigate('/')}>←</button>
        <div>
          <h1 className="page-header__title">🎤 Speaking</h1>
          <p className="page-header__subtitle">Day {currentDay} — {lesson?.topic}</p>
        </div>
      </header>

      {/* Prompt */}
      <div className="speaking__prompt animate-fade-in-up stagger-1">
        <div className="speaking__prompt-card glass">
          <h3 className="speaking__prompt-label">Read this aloud:</h3>
          <p className="speaking__prompt-text">{speakingPrompt}</p>
        </div>
      </div>

      {/* Recorder */}
      <div className="speaking__recorder animate-fade-in-up stagger-2">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={submitting}
        />
      </div>

      {/* Submit button */}
      {audioBlob && !result && (
        <div className="speaking__submit animate-fade-in">
          <button
            className={`btn btn--primary btn--full ${submitting ? 'btn--loading' : ''}`}
            onClick={handleSubmit}
            disabled={submitting}
            id="btn-submit-speaking"
          >
            {submitting ? (
              <>
                <div className="btn__spinner" />
                Analyzing your speech...
              </>
            ) : (
              '🚀 Submit for AI Analysis'
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && !result.error && (
        <div className="speaking__result animate-fade-in-up">
          <div className="speaking__result-card glass">
            {/* Score */}
            <div className="speaking__score">
              <div className={`speaking__score-circle ${
                result.score >= 80 ? 'speaking__score--great' :
                result.score >= 50 ? 'speaking__score--good' :
                'speaking__score--keep-going'
              }`}>
                <span className="speaking__score-value">{result.score}</span>
                <span className="speaking__score-label">/ 100</span>
              </div>
              <span className="speaking__score-emoji">
                {result.score >= 80 ? '🌟' : result.score >= 50 ? '👍' : '💪'}
              </span>
            </div>

            {/* What you said */}
            <div className="speaking__transcription">
              <h4>What you said:</h4>
              <p className="speaking__transcription-text">"{result.transcription}"</p>
            </div>

            {/* Feedback */}
            <div className="speaking__feedback">
              <h4>AI Feedback:</h4>
              <p>{result.feedback}</p>
            </div>

            {/* Actions */}
            <div className="speaking__result-actions">
              <button
                className="btn btn--outline"
                onClick={() => { setAudioBlob(null); setResult(null); }}
                id="btn-try-again"
              >
                🔄 Try Again
              </button>
              <button
                className="btn btn--primary"
                onClick={() => navigate('/')}
                id="btn-back-dashboard"
              >
                ✓ Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {result?.error && (
        <div className="speaking__error animate-fade-in glass">
          <p>❌ {result.error}</p>
          <button
            className="btn btn--outline"
            onClick={() => { setAudioBlob(null); setResult(null); }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
