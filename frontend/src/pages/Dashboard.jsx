import { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { authenticate, getProgress } from '../services/api';
import ProgressRing from '../components/ProgressRing';
import SkillCard from '../components/SkillCard';

export default function Dashboard() {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        // Authenticate and get user data
        await authenticate();
        const res = await getProgress();
        setData(res.data);

        // Find today's progress
        const today = res.data.progress.find(p => p.day_number === res.data.currentDay);
        setTodayProgress(today || {});
      } catch (err) {
        console.error('Dashboard init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader__spinner" />
        <p>Loading your progress...</p>
      </div>
    );
  }

  const currentDay = data?.currentDay || 1;
  const completedDays = data?.completedDays || 0;
  const streak = data?.currentStreak || 0;
  const overallProgress = Math.round((completedDays / 60) * 100);

  const skills = [
    {
      icon: '📚',
      title: 'Vocabulary',
      description: 'Learn 8 IT & Business words',
      done: todayProgress?.vocab_done,
      to: '/vocabulary',
    },
    {
      icon: '🎧',
      title: 'Listening',
      description: 'Listen and comprehend',
      done: todayProgress?.listening_done,
      to: '/listening',
    },
    {
      icon: '🎤',
      title: 'Speaking',
      description: 'Read aloud & get AI feedback',
      done: todayProgress?.speaking_done,
      to: '/speaking',
    },
    {
      icon: '✍️',
      title: 'Writing',
      description: 'Write & get grammar checked',
      done: todayProgress?.writing_done,
      to: '/writing',
    },
  ];

  const todayDone = [
    todayProgress?.vocab_done,
    todayProgress?.listening_done,
    todayProgress?.speaking_done,
    todayProgress?.writing_done,
  ].filter(Boolean).length;

  const todayPercent = Math.round((todayDone / 4) * 100);

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <header className="dashboard__hero animate-fade-in-up">
        <div className="dashboard__greeting">
          <h1 className="dashboard__title">
            Hey, <span className="gradient-text">{user?.first_name || 'Learner'}</span>! 🚀
          </h1>
          <p className="dashboard__subtitle">Your daily English journey</p>
        </div>

        <div className="dashboard__ring-wrapper">
          <ProgressRing
            progress={todayPercent}
            size={140}
            strokeWidth={10}
            label={`Day ${currentDay}`}
            sublabel="of 60"
          />
        </div>
      </header>

      {/* Stats Row */}
      <div className="dashboard__stats animate-fade-in-up stagger-1">
        <div className="stat-card glass">
          <span className="stat-card__icon">🔥</span>
          <div className="stat-card__info">
            <span className="stat-card__value">{streak}</span>
            <span className="stat-card__label">Day Streak</span>
          </div>
        </div>
        <div className="stat-card glass">
          <span className="stat-card__icon">📅</span>
          <div className="stat-card__info">
            <span className="stat-card__value">{completedDays}</span>
            <span className="stat-card__label">Days Done</span>
          </div>
        </div>
        <div className="stat-card glass">
          <span className="stat-card__icon">📊</span>
          <div className="stat-card__info">
            <span className="stat-card__value">{overallProgress}%</span>
            <span className="stat-card__label">Overall</span>
          </div>
        </div>
      </div>

      {/* Today's progress bar */}
      <div className="dashboard__today-bar animate-fade-in-up stagger-2">
        <div className="today-bar__header">
          <span className="today-bar__label">Today's Progress</span>
          <span className="today-bar__count">{todayDone}/4 skills</span>
        </div>
        <div className="today-bar__track">
          <div
            className="today-bar__fill"
            style={{ width: `${todayPercent}%` }}
          />
        </div>
      </div>

      {/* Skill Cards */}
      <section className="dashboard__skills">
        <h2 className="dashboard__section-title animate-fade-in-up stagger-2">Today's Exercises</h2>
        {skills.map((skill, i) => (
          <SkillCard key={skill.title} {...skill} delay={0.2 + i * 0.1} />
        ))}
      </section>

      {/* Motivational footer */}
      {todayDone === 4 && (
        <div className="dashboard__complete-banner animate-fade-in-up glass">
          <span className="dashboard__complete-emoji">🎉</span>
          <p className="dashboard__complete-text">
            Amazing! You completed today's lesson!<br/>
            Come back tomorrow for Day {currentDay + 1}.
          </p>
        </div>
      )}
    </div>
  );
}
