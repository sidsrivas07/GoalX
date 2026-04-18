import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Clock, Plus, Trash2 } from 'lucide-react';
import './DetailView.css';

export default function DetailView({ categories, onToggleTask, onDeleteTask, onAddTask }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [newTaskName, setNewTaskName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return (
      <div className="detail-view">
        <div className="detail-header">
          <button className="detail-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <h2>Not Found</h2>
        </div>
        <p className="detail-empty">This category doesn't exist.</p>
      </div>
    );
  }

  const completedCount = category.tasks.filter(t => t.completed).length;
  const progressPercent = category.tasks.length > 0 
    ? Math.round((completedCount / category.tasks.length) * 100) 
    : 0;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    onAddTask(categoryId, { name: newTaskName.trim() });
    setNewTaskName('');
    setShowInput(false);
  };

  return (
    <motion.div
      className="detail-view"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="detail-header">
        <button className="detail-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div className="detail-header-text">
          <h2>{category.name}</h2>
          <span className="detail-task-count">
            {completedCount}/{category.tasks.length} completed
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="detail-progress-section glass-panel">
        <div className="detail-progress-info">
          <span className="detail-progress-label">Progress</span>
          <span className="detail-progress-percent">{progressPercent}%</span>
        </div>
        <div className="detail-progress-bar-bg">
          <motion.div
            className="detail-progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="detail-task-list">
        <AnimatePresence>
          {category.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              className={`detail-task-row glass-panel ${task.completed ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              layout
            >
              <button
                className={`detail-checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => onToggleTask(categoryId, task.id)}
                aria-label={`Toggle ${task.name}`}
              >
                {task.completed && <Check size={14} strokeWidth={3} />}
              </button>

              <div className="detail-task-info">
                <span className="detail-task-name">{task.name}</span>
                {task.time && (
                  <span className="detail-task-time">
                    <Clock size={12} />
                    {task.time}
                    {task.duration && ` · ${task.duration}`}
                  </span>
                )}
              </div>

              <button
                className="detail-delete-btn"
                onClick={() => onDeleteTask(categoryId, task.id)}
                aria-label={`Delete ${task.name}`}
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Inline Add Task */}
      <AnimatePresence>
        {showInput && (
          <motion.form
            className="detail-add-form glass-panel"
            onSubmit={handleAddTask}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <input
              type="text"
              className="detail-add-input"
              placeholder="New task name..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="detail-add-submit"
              disabled={!newTaskName.trim()}
            >
              Add
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <button
        className="detail-add-toggle"
        onClick={() => setShowInput(!showInput)}
      >
        <Plus size={18} />
        {showInput ? 'Cancel' : 'Add Task'}
      </button>
    </motion.div>
  );
}
