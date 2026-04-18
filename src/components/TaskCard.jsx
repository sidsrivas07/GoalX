import { motion } from 'framer-motion';
import { Check, Plus, Trash2, Clock, MoreVertical } from 'lucide-react';
import './TaskCard.css';

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TaskCard({ task, index, onToggleDay, onDelete }) {
  // Simple calculation for UI demo
  const progressPercent = task.timeEst ? Math.round((task.timeSpent / task.timeEst) * 100) : 0;

  return (
    <motion.div 
      className="task-card glass-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      layout
    >
      <div className="card-header">
        <span className="task-name">{task.name}</span>
        
        <div className="card-actions">
           <button 
             className="icon-btn delete" 
             onClick={onDelete}
             aria-label="Delete task"
           >
             <Trash2 size={16} />
           </button>
           <button className="icon-btn">
             <MoreVertical size={16} />
           </button>
        </div>
      </div>
      
      {task.frequency === 'specific' ? (
        // Progress Bar tracking for specific projects
        <div className="progress-section">
           <div className="progress-info">
             <div className="time-spent">
                <Clock size={14} className="time-icon" />
                <span>{task.timeSpent} Hrs / {task.timeEst} Hrs</span>
             </div>
             <span className="percent-text">{progressPercent}%</span>
           </div>
           <div className="progress-bar-bg">
             <motion.div 
               className="progress-bar-fill"
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
             />
           </div>
        </div>
      ) : (
        // Habit bubbles for daily tasks
        <div className="task-habits">
          {weekDays.map((day, dIndex) => {
              const isCompleted = task.completedDays.includes(day);

              return (
                  <div key={`${day}-${dIndex}`} className="day-column">
                    <button 
                      className={`day-bubble ${isCompleted ? 'completed' : ''}`}
                      aria-label={`Mark ${day} as done`}
                      onClick={() => onToggleDay(day)}
                    >
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : null}
                    </button>
                    <span className="day-label">{day}</span>
                  </div>
              )
          })}
        </div>
      )}
    </motion.div>
  );
}
