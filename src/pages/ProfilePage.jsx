import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Bell, Shield, ChevronRight, Save, ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [notifsOn, setNotifsOn] = useState(localStorage.getItem('APP_NOTIFS') !== 'false');
  
  // Local state for editing fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');

  // Sync state when user context loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAge(user.age || '');
      setCountry(user.country || '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const updated = await api.put('/auth/profile', {
        name,
        email,
        age: age ? parseInt(age) : null,
        country
      });
      setUser(prev => ({ ...prev, ...updated }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Save failed: ' + err.message);
    }
  };

  const toggleNotifs = () => {
    const newState = !notifsOn;
    setNotifsOn(newState);
    localStorage.setItem('APP_NOTIFS', newState);
  };

  if (!user) return <div className="profile-page">Loading Profile...</div>;

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
        
        {isEditing ? (
          <div className="profile-info-edit">
            <input 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <input 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
        ) : (
          <div className="profile-info">
            <h2 className="profile-name">{user.name || 'Anonymous User'}</h2>
            <p className="profile-email">{user.email || 'anonymous@goalx.app'}</p>
          </div>
        )}

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
                 {isEditing ? (
                   <>
                     <div className="floating-label-group">
                       <input 
                        id="name"
                        placeholder=" " 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                       />
                       <label htmlFor="name">Full Name</label>
                     </div>
                     
                     <div className="floating-label-group">
                       <input 
                        id="age"
                        type="number"
                        placeholder=" " 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)} 
                       />
                       <label htmlFor="age">Age</label>
                     </div>

                     <div className="floating-label-group">
                       <input 
                        id="country"
                        placeholder=" " 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)} 
                       />
                       <label htmlFor="country">Country</label>
                     </div>
                   </>
                 ) : (
                   <>
                    <div className="group-item-static">
                        <span className="item-label text-muted text-xs">Full Name</span>
                        <span className="item-value">{user.name || 'Set Name'}</span>
                    </div>
                    <div className="group-divider" />
                    <div className="group-item-static" style={{ padding: '12px 0' }}>
                        <span className="item-label text-muted text-xs">Age</span>
                        <span className="item-value">{user.age || '--'} Years</span>
                    </div>
                    <div className="group-divider" />
                    <div className="group-item-static">
                        <span className="item-label text-muted text-xs">Country</span>
                        <span className="item-value">{user.country || 'Not Set'}</span>
                    </div>
                   </>
                 )}
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
        </section>

      </div>

      <div className="profile-version-footer">
        GoalX v1.07
      </div>
    </motion.div>
  );
}
