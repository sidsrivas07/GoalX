import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { ListTodo, Dumbbell, BookOpen, FolderKanban } from 'lucide-react';
import Calendar from '../components/Calendar.jsx';
import CalendarModal from '../components/CalendarModal.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import './HomePage.css';

const CATEGORY_CONFIG = {
  'daily-tasks': { icon: ListTodo, color: '#ff6b00' },
  'gym-workout': { icon: Dumbbell, color: '#ff8c00' },
  'study-plan': { icon: BookOpen, color: '#ffaa33' },
  'projects': { icon: FolderKanban, color: '#cc5500' },
};

export default function HomePage({ categories, selectedDate, onSelectDate, onCategoryClick }) {
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
        <div className="home-avatar">
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
            const config = CATEGORY_CONFIG[category.id] || { icon: ListTodo, color: '#ff6b00' };
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
