import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Flame } from 'lucide-react';
import { api } from '../api';
import './StatsPage.css';

export default function StatsPage({ categories }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [overallStreak, setOverallStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const data = await api.get('/stats/streak');
        setOverallStreak(data.streak || 0);
      } catch (err) {
        console.error('Failed to fetch streak', err);
      }
    };
    fetchStreak();
  }, []);

  // Completion calculation for "That particular day"
  // Since categories is already date-filtered from App.jsx, we just use it directly
  const totalTasks = categories.reduce((sum, c) => sum + c.tasks.length, 0);
  const completedTasks = categories.reduce((sum, c) => sum + c.tasks.filter(t => t.completed).length, 0);
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Flatten all daily tasks for streaks
  const dailyTasks = categories.flatMap(c => c.tasks.filter(t => t.recurrence === 'DAILY'));

  const stats = [
    { icon: Target, label: 'Completion', value: `${overallPercent}%`, color: '#ff6b00' },
    { icon: Flame, label: 'Best Streak', value: `${overallStreak} d`, color: '#ff8c00' },
    { icon: TrendingUp, label: 'Tasks Done', value: `${completedTasks}`, color: '#ffaa33' },
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

      {/* Tabs */}
      <div className="stats-tabs glass-panel">
        <button 
          className={`stats-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`stats-tab ${activeTab === 'streaks' ? 'active' : ''}`}
          onClick={() => setActiveTab('streaks')}
        >
          Streaks
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Big Ring */}
            <div className="stats-ring-section glass-panel">
              <div className="stats-ring-container">
                <svg className="stats-ring" viewBox="0 0 120 120">
                  <circle className="stats-ring-bg" cx="60" cy="60" r="50" fill="none" strokeWidth="8" />
                  <motion.circle
                    className="stats-ring-fill"
                    cx="60" cy="60" r="50"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - overallPercent / 100) }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="stats-ring-text">
                  <span className="stats-ring-percent">{overallPercent}%</span>
                  <span className="stats-ring-label">Done Today</span>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="stats-cards">
              {stats.map((stat, index) => (
                <div key={stat.label} className="stat-card glass-panel">
                  <div className="stat-card-icon" style={{ background: `${stat.color}18`, color: stat.color }}>
                    <stat.icon size={20} />
                  </div>
                  <div className="stat-card-content">
                    <span className="stat-card-value">{stat.value}</span>
                    <span className="stat-card-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Per-Category Breakdown */}
            <section className="stats-breakdown">
              <h2 className="section-title">Category Breakdown</h2>
              {categories.map((category, index) => {
                const done = category.tasks.filter(t => t.completed).length;
                const pct = category.tasks.length > 0 ? Math.round((done / category.tasks.length) * 100) : 0;
                if (category.tasks.length === 0) return null;
                return (
                  <div key={category.id} className="breakdown-row glass-panel">
                    <div className="breakdown-info">
                      <span className="breakdown-name">{category.name}</span>
                      <span className="breakdown-count">{done}/{category.tasks.length}</span>
                    </div>
                    <div className="breakdown-bar-bg">
                      <motion.div
                        className="breakdown-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })}
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="streaks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="streaks-tab-content"
          >
            <section className="streaks-list">
              <h2 className="section-title">Habit Streaks</h2>
              {dailyTasks.length > 0 ? (
                dailyTasks.map((task) => (
                  <div key={task.id} className="streak-item glass-panel">
                    <div className="streak-item-left">
                      <div className="streak-icon-bg">
                        <Flame size={20} className={task.currentStreak > 0 ? 'orange' : 'gray'} />
                      </div>
                      <div className="streak-info">
                        <span className="streak-name">{task.name}</span>
                        <span className="streak-best">Best: {task.longestStreak || 0}</span>
                      </div>
                    </div>
                    <div className="streak-count-badge">
                      <span className="streak-number">{task.currentStreak || 0}</span>
                      <span className="streak-label">DAYS</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No daily habits scheduled for today.</p>
                </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
