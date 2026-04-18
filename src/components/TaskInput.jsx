import { useState } from 'react';
import { Plus, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import './TaskInput.css';

export default function TaskInput({ onAddTask }) {
  const [taskName, setTaskName] = useState('');
  const [frequency, setFrequency] = useState('daily'); // 'daily' or 'specific'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    onAddTask({ name: taskName, frequency });
    setTaskName('');
  };

  return (
    <motion.form 
      className="task-input-form glass-panel" 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="form-header">
         <h2>Create a Task</h2>
      </div>

      <div className="input-row">
        <input 
          type="text" 
          placeholder="New Web and UI Project..." 
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="task-input-field"
        />
        <button type="submit" className="add-button" disabled={!taskName.trim()}>
          <Plus size={20} />
        </button>
      </div>
      
      <div className="frequency-selector">
        <button 
          type="button" 
          className={`freq-btn ${frequency === 'daily' ? 'active' : ''}`}
          onClick={() => setFrequency('daily')}
        >
          <Clock size={16} />
          Daily
        </button>
        <button 
          type="button" 
          className={`freq-btn ${frequency === 'specific' ? 'active' : ''}`}
          onClick={() => setFrequency('specific')}
        >
          <Target size={16} />
          Project
        </button>
      </div>
    </motion.form>
  );
}
