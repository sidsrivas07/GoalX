import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Flame } from 'lucide-react';
import { api } from '../api';
import './StatsPage.css';

export default function StatsPage({ categories }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const data = await api.get('/stats/streak');
        setStreak(data.streak || 0);
      } catch (err) {
        console.error('Failed to fetch streak', err);
      }
    };
    fetchStreak();
  }, [categories]);

  const totalTasks = categories.reduce((sum, c) => sum + c.tasks.length, 0);
  const completedTasks = categories.reduce((sum, c) => sum + c.tasks.filter(t => t.completed).length, 0);
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    { icon: Target, label: 'Completion Rate', value: `${overallPercent}%`, color: '#ff6b00' },
    { icon: Flame, label: 'Current Streak', value: `${streak} days`, color: '#ff8c00' },
    { icon: TrendingUp, label: 'Tasks This Week', value: `${completedTasks}`, color: '#ffaa33' },
  ];

  return (
    <motion.div
      className="stats-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="stats-page-header">
        <BarChart3 size={22} className="stats-page-icon" />
        <h1>Statistics</h1>
      </header>

      {/* Big Ring */}
      <div className="stats-ring-section glass-panel">
        <div className="stats-ring-container">
          <svg className="stats-ring" viewBox="0 0 120 120">
            <circle
              className="stats-ring-bg"
              cx="60" cy="60" r="50"
              fill="none"
              strokeWidth="8"
            />
            <motion.circle
              className="stats-ring-fill"
              cx="60" cy="60" r="50"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - overallPercent / 100) }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="stats-ring-text">
            <span className="stats-ring-percent">{overallPercent}%</span>
            <span className="stats-ring-label">Overall</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-cards">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card glass-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
          >
            <div className="stat-card-icon" style={{ background: `${stat.color}18`, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stat.value}</span>
              <span className="stat-card-label">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Per-Category Breakdown */}
      <section className="stats-breakdown">
        <h2 className="section-title">Category Breakdown</h2>
        {categories.map((category, index) => {
          const done = category.tasks.filter(t => t.completed).length;
          const pct = category.tasks.length > 0 ? Math.round((done / category.tasks.length) * 100) : 0;
          return (
            <motion.div
              key={category.id}
              className="breakdown-row glass-panel"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
            >
              <div className="breakdown-info">
                <span className="breakdown-name">{category.name}</span>
                <span className="breakdown-count">{done}/{category.tasks.length}</span>
              </div>
              <div className="breakdown-bar-bg">
                <motion.div
                  className="breakdown-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </section>
    </motion.div>
  );
}
