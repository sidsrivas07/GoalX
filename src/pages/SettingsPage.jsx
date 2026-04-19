import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Palette, Save, ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Settings State (Persisted in localStorage)
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');

  const handleSaveApi = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
  };

  const themeOptions = [
    { id: 'system', icon: Monitor, label: 'System Default' },
    { id: 'light', icon: Sun, label: 'Light Mode' },
    { id: 'dark', icon: Moon, label: 'Dark Mode' }
  ];

  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <header className="settings-header-top">
        <button className="settings-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>Settings</h1>
      </header>

      {/* Theme Section */}
      <section className="settings-section">
        <div className="section-title-wrap">
          <Palette size={18} className="orange" />
          <h2>Appearance</h2>
        </div>
        <div className="theme-options">
          {themeOptions.map(option => (
            <button
              key={option.id}
              className={`theme-option glass-panel ${theme === option.id ? 'active' : ''}`}
              onClick={() => setTheme(option.id)}
            >
              <option.icon size={20} className={theme === option.id ? 'orange' : ''} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* API Key Section */}
      <section className="settings-section">
        <div className="section-title-wrap">
          <Key size={18} className="orange" />
          <h2>API Configuration</h2>
        </div>
        <div className="settings-panel glass-panel">
          <p className="settings-desc">Enter your Google Gemini API Key to use your own quota instead of the shared pool.</p>
          <div className="api-key-wrap">
            <input 
              type="password"
              className="api-key-input"
              placeholder="Paste Gemini API Key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className="api-key-save" onClick={handleSaveApi}>Save</button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
