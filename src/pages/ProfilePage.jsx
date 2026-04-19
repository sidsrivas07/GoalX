import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Settings, Bell, Shield, Moon, ChevronRight, LogOut, Save, Key } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State (Persisted in localStorage)
  const [name, setName] = useState(localStorage.getItem('USER_NAME') || 'User');
  const [email, setEmail] = useState(localStorage.getItem('USER_EMAIL') || 'user@goalx.app');
  const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');

  const handleSave = () => {
    localStorage.setItem('USER_NAME', name);
    localStorage.setItem('USER_EMAIL', email);
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setIsEditing(false);
    setShowSettings(false);
  };

  const menuItems = [
    { icon: Bell, label: 'Notifications', value: 'On', onClick: () => {} },
    { icon: Moon, label: 'Dark Mode', value: 'Always', onClick: () => {} },
    { icon: Shield, label: 'Privacy', value: '', onClick: () => {} },
    { icon: Settings, label: 'Settings', value: showSettings ? 'Hide' : 'Configure', onClick: () => setShowSettings(!showSettings) },
  ];

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="profile-page-header">
        <UserCircle size={22} className="profile-page-icon" />
        <h1>Profile</h1>
      </header>

      {/* Profile Card */}
      <div className="profile-card glass-panel">
        <div className="profile-avatar-large">
          <UserCircle size={48} strokeWidth={1.2} />
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div className="profile-edit-fields">
              <input 
                className="profile-input-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your Name"
              />
              <input 
                className="profile-input-email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email"
              />
            </div>
          ) : (
            <>
              <h2 className="profile-name">{name}</h2>
              <p className="profile-email">{email}</p>
            </>
          )}
        </div>
        <button 
          className={`profile-edit-btn ${isEditing ? 'active' : ''}`}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? <Save size={16} /> : 'Edit'}
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            className="settings-panel glass-panel"
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          >
            <div className="settings-header">
              <Key size={16} className="orange" />
              <h3>API Configuration</h3>
            </div>
            <p className="settings-desc">Enter your Google Gemini API Key to use your own quota.</p>
            <div className="api-key-wrap">
              <input 
                type="password"
                className="api-key-input"
                placeholder="Paste Gemini API Key here..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button className="api-key-save" onClick={handleSave}>Apply</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu */}
      <div className="profile-menu">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            className={`profile-menu-item glass-panel ${item.label === 'Settings' && showSettings ? 'active' : ''}`}
            onClick={item.onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.06, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="menu-item-left">
              <div className="menu-item-icon">
                <item.icon size={18} />
              </div>
              <span className="menu-item-label">{item.label}</span>
            </div>
            <div className="menu-item-right">
              {item.value && <span className="menu-item-value">{item.value}</span>}
              <ChevronRight size={16} className={item.label === 'Settings' && showSettings ? 'rotate-down' : ''} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <button className="profile-logout-btn">
        <LogOut size={18} />
        Sign Out
      </button>
    </motion.div>
  );
}
