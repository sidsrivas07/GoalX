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



  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div 
        className="home-header"
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          width: '100%',
          marginBottom: '16px'
        }}
      >
        <div className="home-header-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="home-title" style={{ margin: 0 }}>Dashboard</h1>
          <p className="home-greeting" style={{ margin: 0 }}>{greeting}</p>
        </div>
        <div 
          className="home-avatar-container" 
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer', flexShrink: 0, marginTop: '4px' }}
        >
          <User size={28} />
        </div>
      </div>



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
      <section className="home-categories-container glass-panel">
        <h2 className="section-title large">My Categories</h2>
        {categories.length > 0 ? (
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
        ) : (
          <div className="categories-empty-state">
            <Sparkles size={28} style={{ color: 'var(--orange-primary)', marginBottom: '8px' }} />
            <p>No categories yet</p>
            <span>Tap the + button to generate your first AI schedule</span>
          </div>
        )}
      </section>
    </motion.div>
  );
}
