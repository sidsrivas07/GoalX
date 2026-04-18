import { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import './Calendar.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarWidget({ selectedDate, onSelectDate, onExpand }) {
  const scrollRef = useRef(null);

  // Generate a range of days (e.g., 7 days before and after selected date)
  const days = useMemo(() => {
    const range = [];
    const baseDate = new Date(selectedDate);
    // Start from 3 days ago to 3 days ahead
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      range.push(d);
    }
    return range;
  }, [selectedDate]);

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const monthLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  return (
    <div className="calendar-widget glass-panel">
      <div className="cal-widget-header">
        <div className="cal-widget-title-wrap">
          <h3 className="cal-widget-month">{monthLabel}</h3>
          <span className="cal-widget-subtitle">Week View</span>
        </div>
        <button className="cal-expand-btn" onClick={onExpand} aria-label="Expand calendar">
          <Maximize2 size={18} />
        </button>
      </div>

      <div className="cal-week-scroll-container">
        <div className="cal-week-grid" ref={scrollRef}>
          {days.map((date, i) => {
            const selected = isSelected(date);
            const today = isToday(date);
            
            return (
              <motion.button
                key={date.toISOString()}
                className={`cal-week-day ${selected ? 'selected' : ''} ${today ? 'today' : ''}`}
                onClick={() => onSelectDate(date)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="cal-week-day-name">{DAYS_OF_WEEK[date.getDay()]}</span>
                <span className="cal-week-day-num">{date.getDate()}</span>
                {today && !selected && <div className="today-indicator" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
