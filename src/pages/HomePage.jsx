import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { ListTodo, Dumbbell, BookOpen, FolderKanban, Sparkles, Gift } from 'lucide-react';
import Calendar from '../components/Calendar';
import CalendarModal from '../components/CalendarModal';
import CategoryCard from '../components/CategoryCard';

const CATEGORY_ICONS = {
  'Daily Habits': { icon: ListTodo, color: '#ff6b00' },
  'Festivals': { icon: Sparkles, color: '#e11d48' },
  'Gym Workout': { icon: Dumbbell, color: '#ff8c00' },
  'Study Plan': { icon: BookOpen, color: '#ffaa33' },
  'General Tasks': { icon: FolderKanban, color: '#3B82F6' },
  'Miscellaneous': { icon: FolderKanban, color: '#6366f1' },
};

export default function HomePage({ categories, selectedDate, onSelectDate, onCategoryClick }) {
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = new Date();
  const hour = today.getHours();
  let greeting = 'Hello';
  
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 16) greeting = 'Good afternoon';
  else if (hour >= 16 && hour < 21) greeting = 'Good evening';
  else greeting = 'Good night';

  const totalTasks = categories.reduce((sum, c) => sum + c.tasks.length, 0);
  const completedTasks = categories.reduce((sum, c) => sum + c.tasks.filter(t => t.completed).length, 0);

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="home-header">
        <div className="home-header-text">
          <p className="home-greeting">{greeting}</p>
          <h1 className="home-title">Dashboard</h1>
        </div>
        <div className="home-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <User size={20} />
        </div>
      </header>

      {/* Stats Summary */}
      <motion.div
        className="home-stats"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="stat-item">
          <span className="stat-number">{totalTasks}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number orange">{completedTasks}</span>
          <span className="stat-label">Done</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{totalTasks - completedTasks}</span>
          <span className="stat-label">Pending</span>
        </div>
      </motion.div>

      {/* Calendar */}
      <Calendar 
        selectedDate={selectedDate} 
        onSelectDate={onSelectDate} 
        onExpand={() => setIsCalendarOpen(true)}
      />

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      {/* Categories */}
      <section className="home-categories">
        <h2 className="section-title">My Categories</h2>
        <div className="categories-grid">
          {categories.map((category, index) => {
            const config = CATEGORY_ICONS[category.name] || { icon: ListTodo, color: category.accentColor || '#ff6b00' };
            const tasksDone = category.tasks.filter(t => t.completed).length;
            return (
              <CategoryCard
                key={category.id}
                icon={config.icon}
                title={category.name}
                subtitle={`${tasksDone}/${category.tasks.length} completed`}
                taskCount={category.tasks.length}
                accentColor={config.color}
                onClick={() => onCategoryClick(category.id)}
                index={index}
              />
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
