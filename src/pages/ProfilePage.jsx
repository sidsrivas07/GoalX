import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Bell, Shield, ChevronRight, LogOut, Save, ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [notifsOn, setNotifsOn] = useState(localStorage.getItem('APP_NOTIFS') !== 'false');
  
  // Personal Info (Synced with localStorage)
  const [name, setName] = useState(localStorage.getItem('USER_NAME') || 'User');
  const [email, setEmail] = useState(localStorage.getItem('USER_EMAIL') || 'user@goalx.app');
  const [age, setAge] = useState(localStorage.getItem('USER_AGE') || '24');
  const [country, setCountry] = useState(localStorage.getItem('USER_COUNTRY') || 'India');

  const handleSave = () => {
    localStorage.setItem('USER_NAME', name);
    localStorage.setItem('USER_EMAIL', email);
    localStorage.setItem('USER_AGE', age);
    localStorage.setItem('USER_COUNTRY', country);
    setIsEditing(false);
  };

  const toggleNotifs = () => {
    const newState = !notifsOn;
    setNotifsOn(newState);
    localStorage.setItem('APP_NOTIFS', newState);
  };

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
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
          <UserCircle size={44} strokeWidth={1.5} />
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
                placeholder="Email Address"
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

      <div className="profile-menu-container">
        
        {/* Privacy & Info Toggle Section */}
        <section className="profile-group-section">
          <div className="group-label">Security & Access</div>
          
          <div className="glass-panel menu-row" onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}>
            <div className="menu-row-left">
              <div className="menu-icon-bg"><Shield size={18} /></div>
              <span>Privacy & Identity</span>
            </div>
            <div className="menu-row-right">
              <ChevronRight size={16} style={{ transform: isPrivacyOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
            </div>
          </div>

          <AnimatePresence>
            {isPrivacyOpen && (
              <motion.div 
                className="glass-panel group-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginTop: '4px' }}
              >
                 <div className="group-item">
                    <span className="item-label">Full Name</span>
                    {isEditing ? (
                      <input className="item-input" value={name} onChange={(e) => setName(e.target.value)} />
                    ) : (
                      <span className="item-value">{name}</span>
                    )}
                 </div>
                 <div className="group-divider" />
                 <div className="group-item">
                    <span className="item-label">Age</span>
                    {isEditing ? (
                      <input className="item-input" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                    ) : (
                      <span className="item-value">{age} Years</span>
                    )}
                 </div>
                 <div className="group-divider" />
                 <div className="group-item">
                    <span className="item-label">Country</span>
                    {isEditing ? (
                      <input className="item-input" value={country} onChange={(e) => setCountry(e.target.value)} />
                    ) : (
                      <span className="item-value">{country}</span>
                    )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Settings & Toggles */}
        <section className="profile-group-section">
          <div className="group-label">Preferences</div>
          
          <button className="glass-panel menu-row" onClick={() => navigate('/settings')}>
            <div className="menu-row-left">
              <div className="menu-icon-bg"><Settings size={18} /></div>
              <span>Settings</span>
            </div>
            <div className="menu-row-right">
              <span className="text-muted text-xs">Theme, API Key</span>
              <ChevronRight size={16} />
            </div>
          </button>

          <div className="glass-panel menu-row" onClick={toggleNotifs} style={{ marginTop: '8px' }}>
            <div className="menu-row-left">
              <div className="menu-icon-bg"><Bell size={18} /></div>
              <span>Notifications</span>
            </div>
            <div className="menu-row-right">
              <div className={`sliding-toggle ${notifsOn ? 'on' : ''}`}>
                 <motion.div 
                    className="toggle-thumb" 
                    layout 
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
              </div>
            </div>
          </div>

          <div className="glass-panel menu-row" style={{ marginTop: '8px' }}>
            <div className="menu-row-left">
              <div className="menu-icon-bg"><Shield size={18} /></div>
              <span>Data & Usage</span>
            </div>
            <div className="menu-row-right">
              <ChevronRight size={16} />
            </div>
          </div>
        </section>

      </div>

      {/* Logout */}
      <button className="profile-logout-btn">
        <LogOut size={18} />
        Sign Out
      </button>

      <div className="profile-version-footer">
        Version 1.05 (Stable)
      </div>
    </motion.div>
  );
}
