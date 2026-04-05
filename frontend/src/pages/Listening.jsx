import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayLesson, updateProgress } from '../services/api';

export default function Listening() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const speechRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getTodayLesson();
        setLesson(res.data.lesson);
        setCurrentDay(res.data.currentDay);
      } catch (err) {
        console.error('Failed to load listening:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const playAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const text = lesson?.listening_text || '';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;

    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google') || v.lang === 'en-US');
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setPlayCount(prev => prev + 1);
      if (playCount >= 0) setShowQuiz(true);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const generateQuiz = () => {
    const text = lesson?.listening_text || '';
    const sentences = text.split('.').filter(s => s.trim().length > 10);
    if (sentences.length < 2) return null;

    // Pick a sentence and create a fill-in-the-blank
    const targetSentence = sentences[Math.min(1, sentences.length - 1)].trim();
    const words = targetSentence.split(' ').filter(w => w.length > 3);
    if (words.length === 0) return null;

    const blankWord = words[Math.floor(words.length / 2)];
    const question = targetSentence.replace(blankWord, '______');

    // Generate wrong answers
    const allWords = text.split(' ').filter(w => w.length > 3 && w !== blankWord);
    const wrongAnswers = [];
    const used = new Set([blankWord.toLowerCase().replace(/[^a-z]/g, '')]);

    for (const w of allWords) {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (!used.has(clean) && wrongAnswers.length < 3) {
        wrongAnswers.push(w.replace(/[^a-zA-Z]/g, ''));
        used.add(clean);
      }
    }

    // Pad if needed
    while (wrongAnswers.length < 3) {
      wrongAnswers.push(['always', 'never', 'sometimes', 'quickly'][wrongAnswers.length]);
    }

    const options = [blankWord.replace(/[^a-zA-Z]/g, ''), ...wrongAnswers.slice(0, 3)];
    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      question,
      options,
      correct: blankWord.replace(/[^a-zA-Z]/g, ''),
    };
  };

  const [quiz] = useState(() => null);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    if (showQuiz && lesson && !quizData) {
      setQuizData(generateQuiz());
    }
  }, [showQuiz, lesson]);

  const handleAnswer = async (answer) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const correct = answer === quizData?.correct;
    setIsCorrect(correct);

    if (correct) {
      setCompleted(true);
      try {
        await updateProgress(currentDay, 'listening_done');
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader__spinner" />
        <p>Loading listening exercise...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="listening-complete animate-fade-in-up">
        <div className="listening-complete__card glass">
          <span className="listening-complete__emoji">🎧</span>
          <h2>Listening Complete!</h2>
          <p>Great ears! You understood the passage correctly.</p>
          <button className="btn btn--primary" onClick={() => navigate('/')} id="btn-back-dashboard">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listening">
      {/* Header */}
      <header className="page-header animate-fade-in">
        <button className="page-header__back" onClick={() => navigate('/')}>←</button>
        <div>
          <h1 className="page-header__title">🎧 Listening</h1>
          <p className="page-header__subtitle">Day {currentDay} — {lesson?.topic}</p>
        </div>
      </header>

      {/* Audio Player Section */}
      <div className="listening__player animate-fade-in-up stagger-1">
        <div className="listening__player-card glass">
          <div className="listening__visualizer">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`listening__bar ${isPlaying ? 'listening__bar--active' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          <button
            className={`listening__play-btn ${isPlaying ? 'listening__play-btn--playing' : ''}`}
            onClick={playAudio}
            id="btn-play-audio"
          >
            {isPlaying ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <p className="listening__instruction">
            {playCount === 0
              ? 'Tap play to listen to the passage'
              : `Played ${playCount} time${playCount > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Quiz Section */}
      {showQuiz && quizData && (
        <div className="listening__quiz animate-fade-in-up">
          <h3 className="listening__quiz-title">📝 Comprehension Check</h3>
          <p className="listening__quiz-question">Fill in the blank:</p>
          <p className="listening__quiz-sentence">"{quizData.question}"</p>

          <div className="listening__quiz-options">
            {quizData.options.map((option, i) => (
              <button
                key={i}
                className={`listening__quiz-option glass ${
                  selectedAnswer === option
                    ? option === quizData.correct
                      ? 'listening__quiz-option--correct'
                      : 'listening__quiz-option--wrong'
                    : selectedAnswer !== null && option === quizData.correct
                      ? 'listening__quiz-option--correct'
                      : ''
                }`}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                id={`quiz-option-${i}`}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer && !isCorrect && (
            <div className="listening__quiz-retry animate-fade-in">
              <p>Not quite! The correct answer is: <strong>{quizData.correct}</strong></p>
              <button
                className="btn btn--primary"
                onClick={() => {
                  setSelectedAnswer(null);
                  setIsCorrect(null);
                  setShowQuiz(false);
                  setQuizData(null);
                  setTimeout(() => setShowQuiz(true), 100);
                }}
                id="btn-try-again"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
