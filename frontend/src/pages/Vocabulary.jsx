import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayLesson, updateProgress } from '../services/api';

export default function Vocabulary() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [learning, setLearning] = useState([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getTodayLesson();
        setLesson(res.data.lesson);
        setCurrentDay(res.data.currentDay);
      } catch (err) {
        console.error('Failed to load vocabulary:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader__spinner" />
        <p>Loading vocabulary...</p>
      </div>
    );
  }

  const vocab = lesson?.vocabulary || [];
  const currentWord = vocab[currentIndex];
  const totalWords = vocab.length;

  const handleClassify = async (type) => {
    if (type === 'known') {
      setKnown(prev => [...prev, currentIndex]);
    } else {
      setLearning(prev => [...prev, currentIndex]);
    }
    setFlipped(false);

    if (currentIndex < totalWords - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      // All cards reviewed — mark as done
      setCompleted(true);
      try {
        await updateProgress(currentDay, 'vocab_done');
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    }
  };

  if (completed) {
    return (
      <div className="vocab-complete animate-fade-in-up">
        <div className="vocab-complete__card glass">
          <span className="vocab-complete__emoji">🎓</span>
          <h2 className="vocab-complete__title">Vocabulary Complete!</h2>
          <div className="vocab-complete__stats">
            <div className="vocab-complete__stat">
              <span className="vocab-complete__stat-value gradient-text">{known.length}</span>
              <span className="vocab-complete__stat-label">Known</span>
            </div>
            <div className="vocab-complete__stat">
              <span className="vocab-complete__stat-value" style={{ color: 'var(--accent-orange)' }}>{learning.length}</span>
              <span className="vocab-complete__stat-label">Learning</span>
            </div>
          </div>
          <p className="vocab-complete__msg">Great job! Keep reviewing the words you're still learning.</p>
          <button className="btn btn--primary" onClick={() => navigate('/')} id="btn-back-dashboard">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vocabulary">
      {/* Header */}
      <header className="page-header animate-fade-in">
        <button className="page-header__back" onClick={() => navigate('/')}>←</button>
        <div>
          <h1 className="page-header__title">📚 Vocabulary</h1>
          <p className="page-header__subtitle">Day {currentDay} — {lesson?.topic}</p>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="vocab__progress animate-fade-in-up stagger-1">
        <div className="vocab__progress-bar">
          <div
            className="vocab__progress-fill"
            style={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
          />
        </div>
        <span className="vocab__progress-text">{currentIndex + 1} / {totalWords}</span>
      </div>

      {/* Flashcard */}
      <div
        className={`flashcard animate-fade-in-up stagger-2 ${flipped ? 'flashcard--flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
        id="flashcard"
      >
        <div className="flashcard__inner">
          <div className="flashcard__front glass">
            <span className="flashcard__word">{currentWord?.word}</span>
            <span className="flashcard__hint">Tap to flip</span>
          </div>
          <div className="flashcard__back glass">
            <span className="flashcard__translation">{currentWord?.translation}</span>
            <p className="flashcard__example">"{currentWord?.example}"</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {flipped && (
        <div className="vocab__actions animate-fade-in">
          <button
            className="btn btn--danger"
            onClick={() => handleClassify('learning')}
            id="btn-still-learning"
          >
            🔄 Still Learning
          </button>
          <button
            className="btn btn--success"
            onClick={() => handleClassify('known')}
            id="btn-i-know"
          >
            ✓ I Know This
          </button>
        </div>
      )}
    </div>
  );
}
