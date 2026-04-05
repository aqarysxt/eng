import { NavLink, Outlet } from 'react-router-dom';

/**
 * App shell with bottom navigation bar.
 */
export default function Layout() {
  const navItems = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/vocabulary', icon: '📚', label: 'Vocab' },
    { to: '/listening', icon: '🎧', label: 'Listen' },
    { to: '/speaking', icon: '🎤', label: 'Speak' },
    { to: '/writing', icon: '✍️', label: 'Write' },
  ];

  return (
    <div className="layout">
      <main className="layout__content">
        <Outlet />
      </main>

      <nav className="layout__nav" id="bottom-navigation">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `layout__nav-item ${isActive ? 'layout__nav-item--active' : ''}`
            }
            id={`nav-${item.label.toLowerCase()}`}
          >
            <span className="layout__nav-icon">{item.icon}</span>
            <span className="layout__nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
