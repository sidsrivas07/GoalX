import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Bell, Shield, ChevronRight, LogOut, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [notifsOn, setNotifsOn] = useState(localStorage.getItem('APP_NOTIFS') !== 'false');
  
  // Settings State (Persisted in localStorage)
  const [name, setName] = useState(localStorage.getItem('USER_NAME') || 'User');
  const [email, setEmail] = useState(localStorage.getItem('USER_EMAIL') || 'user@goalx.app');

  const handleSave = () => {
    localStorage.setItem('USER_NAME', name);
    localStorage.setItem('USER_EMAIL', email);
    setIsEditing(false);
  };

  const toggleNotifs = () => {
    const newState = !notifsOn;
    setNotifsOn(newState);
    localStorage.setItem('APP_NOTIFS', newState);
  };

  const menuItems = [
    { icon: Bell, label: 'Notifications', value: notifsOn ? 'On' : 'Off', onClick: toggleNotifs },
    { icon: Shield, label: 'Privacy', value: '', onClick: () => {} },
  ];

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <header className="profile-page-header">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
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

      {/* Menu */}
      <div className="profile-menu">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
          <motion.button
            key={item.label}
            className="profile-menu-item glass-panel"
            onClick={item.onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.06, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="menu-item-left">
              <div className="menu-item-icon">
                <Icon size={18} />
              </div>
              <span className="menu-item-label">{item.label}</span>
            </div>
            <div className="menu-item-right">
              {item.value && <span className="menu-item-value">{item.value}</span>}
              {item.label === 'Privacy' && <ChevronRight size={16} />}
            </div>
          </motion.button>
          );
        })}
      </div>

      {/* Logout */}
      <button className="profile-logout-btn">
        <LogOut size={18} />
        Sign Out
      </button>
    </motion.div>
  );
}
