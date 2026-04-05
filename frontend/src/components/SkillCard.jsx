import { useNavigate } from 'react-router-dom';

/**
 * Reusable skill card for the dashboard.
 * Shows skill name, icon, completion status, and navigates on click.
 */
export default function SkillCard({ icon, title, description, done, to, delay = 0 }) {
  const navigate = useNavigate();

  return (
    <button
      className={`skill-card ${done ? 'skill-card--done' : ''} animate-fade-in-up`}
      style={{ animationDelay: `${delay}s` }}
      onClick={() => navigate(to)}
      id={`skill-card-${title.toLowerCase()}`}
    >
      <div className="skill-card__icon-wrap">
        <span className="skill-card__icon">{icon}</span>
        {done && (
          <div className="skill-card__check">✓</div>
        )}
      </div>
      <div className="skill-card__content">
        <h3 className="skill-card__title">{title}</h3>
        <p className="skill-card__desc">{description}</p>
      </div>
      <div className="skill-card__arrow">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}
