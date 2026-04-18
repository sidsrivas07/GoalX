import { motion } from 'framer-motion';
import { UserCircle, Settings, Bell, Shield, Moon, ChevronRight, LogOut } from 'lucide-react';
import './ProfilePage.css';

const MENU_ITEMS = [
  { icon: Bell, label: 'Notifications', value: 'On' },
  { icon: Moon, label: 'Dark Mode', value: 'Always' },
  { icon: Shield, label: 'Privacy', value: '' },
  { icon: Settings, label: 'Settings', value: '' },
];

export default function ProfilePage() {
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
          <h2 className="profile-name">User</h2>
          <p className="profile-email">user@goalx.app</p>
        </div>
        <button className="profile-edit-btn">Edit</button>
      </div>

      {/* Menu */}
      <div className="profile-menu">
        {MENU_ITEMS.map((item, index) => (
          <motion.button
            key={item.label}
            className="profile-menu-item glass-panel"
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
              <ChevronRight size={16} />
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
