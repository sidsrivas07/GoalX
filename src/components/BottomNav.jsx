import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart3, Settings } from 'lucide-react';
import './BottomNav.css';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrap">
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                {isActive && (
                  <motion.div
                    className="nav-active-dot"
                    layoutId="navDot"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </div>
              <span className="nav-label">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
