import { memo } from 'react';
import { motion } from 'framer-motion';
import './CategoryCard.css';

const CategoryCard = memo(function CategoryCard({ icon: Icon, title, subtitle, taskCount, onClick, index = 0, accentColor }) {
  return (
    <motion.button
      className="category-card glass-panel"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="cat-icon-wrap" style={accentColor ? { background: `${accentColor}18`, color: accentColor } : undefined}>
        <Icon size={20} />
      </div>
      <div className="cat-content">
        <span className="cat-title">{title}</span>
        <span className="cat-subtitle">{subtitle}</span>
      </div>
      {taskCount !== undefined && (
        <div className="cat-badge">{taskCount}</div>
      )}
      <div className="cat-accent-strip" style={accentColor ? { background: `linear-gradient(180deg, ${accentColor}, ${accentColor}88)` } : undefined} />
    </motion.button>
  );
});

export default CategoryCard;
