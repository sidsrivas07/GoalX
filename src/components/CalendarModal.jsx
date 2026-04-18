import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './CalendarModal.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarModal({ isOpen, onClose, selectedDate, onSelectDate }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [direction, setDirection] = useState(0);

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDay = useMemo(() => getFirstDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  const goToPrevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const isToday = (day) => {
    return day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear();
  };

  const handleDayClick = (day) => {
    onSelectDate(new Date(currentYear, currentMonth, day));
    onClose();
  };

  // Build day cells
  const dayCells = [];
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(<div key={`empty-${i}`} className="cal-modal-day-cell empty" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayIsToday = isToday(d);
    const dayIsSelected = isSelected(d);
    dayCells.push(
      <motion.button
        key={d}
        className={`cal-modal-day-cell ${dayIsToday ? 'today' : ''} ${dayIsSelected ? 'selected' : ''}`}
        onClick={() => handleDayClick(d)}
        whileTap={{ scale: 0.9 }}
      >
        <span className="cal-modal-day-number">{d}</span>
        {dayIsToday && !dayIsSelected && <span className="cal-modal-today-dot" />}
      </motion.button>
    );
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cal-modal-overlay">
          <motion.div 
            className="cal-modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          <motion.div 
            className="cal-modal-container glass-panel"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="cal-modal-header">
              <button className="cal-modal-close" onClick={onClose}>
                <X size={20} />
              </button>
              
              <div className="cal-modal-nav">
                <button className="cal-modal-nav-btn" onClick={goToPrevMonth}>
                  <ChevronLeft size={20} />
                </button>
                <div className="cal-modal-title">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </div>
                <button className="cal-modal-nav-btn" onClick={goToNextMonth}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="cal-modal-weekday-row">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="cal-modal-weekday">{day}</div>
              ))}
            </div>

            <div className="cal-modal-grid">
              {dayCells}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
