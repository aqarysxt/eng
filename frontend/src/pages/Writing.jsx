import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayLesson, submitWriting } from '../services/api';

export default function Writing() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await getTodayLesson();
        setLesson(res.data.lesson);
        setCurrentDay(res.data.currentDay);
      } catch (err) {
        console.error('Failed to load writing:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    setCharCount(val.length);
  };

  const handleSubmit = async () => {
    if (text.trim().length < 10) return;
    setSubmitting(true);
    try {
      const res = await submitWriting(text, currentDay);
      setResult(res.data);
    } catch (err) {
      console.error('Failed to submit writing:', err);
      setResult({ error: 'Failed to check your writing. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader__spinner" />
        <p>Loading writing exercise...</p>
      </div>
    );
  }

  return (
    <div className="writing">
      {/* Header */}
      <header className="page-header animate-fade-in">
        <button className="page-header__back" onClick={() => navigate('/')}>←</button>
        <div>
          <h1 className="page-header__title">✍️ Writing</h1>
          <p className="page-header__subtitle">Day {currentDay} — {lesson?.topic}</p>
        </div>
      </header>

      {/* Prompt */}
      <div className="writing__prompt animate-fade-in-up stagger-1">
        <div className="writing__prompt-card glass">
          <h3 className="writing__prompt-label">📝 Writing Prompt</h3>
          <p className="writing__prompt-text">{lesson?.writing_prompt}</p>
        </div>
      </div>

      {/* Text input */}
      {!result && (
        <div className="writing__input animate-fade-in-up stagger-2">
          <div className="writing__textarea-wrap">
            <textarea
              className="writing__textarea"
              placeholder="Write your answer here..."
              value={text}
              onChange={handleTextChange}
              rows={6}
              maxLength={1000}
              disabled={submitting}
              id="writing-textarea"
            />
            <div className="writing__textarea-footer">
              <span className={`writing__char-count ${charCount < 10 ? 'writing__char-count--low' : ''}`}>
                {charCount} / 1000
              </span>
              {charCount >= 10 && <span className="writing__ready">✓ Ready to submit</span>}
            </div>
          </div>

          <button
            className={`btn btn--primary btn--full ${submitting ? 'btn--loading' : ''}`}
            onClick={handleSubmit}
            disabled={text.trim().length < 10 || submitting}
            id="btn-submit-writing"
          >
            {submitting ? (
              <>
                <div className="btn__spinner" />
                Checking grammar...
              </>
            ) : (
              '🔍 Check My Writing'
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && !result.error && (
        <div className="writing__result animate-fade-in-up">
          {/* Score */}
          <div className="writing__score-section glass">
            <div className={`writing__score-badge ${
              result.score >= 80 ? 'writing__score--great' :
              result.score >= 50 ? 'writing__score--good' :
              'writing__score--keep-going'
            }`}>
              <span className="writing__score-value">{result.score}</span>
              <span className="writing__score-max">/ 100</span>
            </div>
            <span className="writing__score-emoji">
              {result.score >= 80 ? '🌟 Excellent!' : result.score >= 50 ? '👍 Good job!' : '💪 Keep practicing!'}
            </span>
          </div>

          {/* Original vs Corrected */}
          <div className="writing__comparison">
            <div className="writing__comparison-block glass">
              <h4 className="writing__comparison-label">Your Text:</h4>
              <p className="writing__original-text">{text}</p>
            </div>
            <div className="writing__comparison-arrow">↓</div>
            <div className="writing__comparison-block writing__comparison-block--corrected glass">
              <h4 className="writing__comparison-label">✨ Corrected:</h4>
              <p className="writing__corrected-text">{result.corrected_text}</p>
            </div>
          </div>

          {/* Feedback */}
          <div className="writing__feedback glass">
            <h4>💬 AI Feedback</h4>
            <p>{result.feedback}</p>
          </div>

          {/* Actions */}
          <div className="writing__actions">
            <button
              className="btn btn--outline"
              onClick={() => { setResult(null); setText(''); setCharCount(0); }}
              id="btn-write-again"
            >
              🔄 Write Again
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
      )}

      {/* Error */}
      {result?.error && (
        <div className="writing__error animate-fade-in glass">
          <p>❌ {result.error}</p>
          <button className="btn btn--outline" onClick={() => setResult(null)}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
