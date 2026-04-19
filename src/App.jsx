import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import FAB from './components/FAB';
import AIModal from './components/AIModal';
import DetailView from './components/DetailView';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';
import { api } from './api';
import './App.css';

function App() {
  const { user, isLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Data Fetching ──
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const data = await api.get(`/tasks?date=${dateStr}`);
      
      // Map backend 'status' to frontend 'completed' boolean
      const mappedCategories = data.map(cat => ({
        ...cat,
        tasks: cat.tasks.map(t => ({
          ...t,
          completed: t.status === 'COMPLETED',
          duration: `${t.duration} min`, // frontend UI expects string
          time: new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // frontend friendly
        }))
      }));
      
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  }, [selectedDate, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Task operations ──
  const toggleTask = useCallback(async (categoryId, taskId) => {
    // Optimistic Update
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        tasks: cat.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      };
    }));

    try {
      await api.patch(`/tasks/${taskId}/status`);
      fetchDashboardData(); // Resync
    } catch (error) {
      console.error('Failed to toggle task', error);
      fetchDashboardData(); // Rollback
    }
  }, [fetchDashboardData]);

  const deleteTask = useCallback(async (categoryId, taskId) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        tasks: cat.tasks.filter(t => t.id !== taskId),
      };
    }));

    try {
      await api.delete(`/tasks/${taskId}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete task', error);
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  const addTask = useCallback(async (categoryId, task) => {
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Convert "10:00 AM" or "10:00" string into an ISO Date for the backend
      const timeParts = task.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      let isoTime = new Date();
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const mins = parseInt(timeParts[2]);
        const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        isoTime = new Date(selectedDate);
        isoTime.setHours(hours, mins, 0, 0);
      }

      await api.post('/tasks', {
        name: task.name,
        time: isoTime.toISOString(),
        duration: parseInt(task.duration) || 30,
        date: dateStr,
        categoryId: categoryId
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  }, [selectedDate, fetchDashboardData]);

  const updateTask = useCallback(async (categoryId, taskId, updates) => {
    try {
      await api.patch(`/tasks/${taskId}`, updates);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update task', error);
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  // ── UI Handlers ──
  const handleCategoryClick = useCallback((categoryId) => {
    navigate(`/category/${categoryId}`);
  }, [navigate]);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b00' }}>Loading GoalX...</div>;
  }

  const isDetailView = location.pathname.startsWith('/category/');

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <HomePage
                categories={categories}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onCategoryClick={handleCategoryClick}
              />
            }
          />
          <Route path="/stats" element={<StatsPage categories={categories} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/category/:categoryId"
            element={
              <DetailView
                categories={categories}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onAddTask={addTask}
                onUpdateTask={updateTask}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {!isDetailView && (
        <FAB isOpen={isModalOpen} onClick={() => setIsModalOpen(!isModalOpen)} />
      )}

      <AIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlanGenerated={() => { 
          setIsModalOpen(false); 
          fetchDashboardData();
        }}
      />

      {!isDetailView && <BottomNav />}
    </div>
  );
}

export default App;
