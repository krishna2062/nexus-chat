import { useState, useEffect } from 'react';
import { ChevronLeft, Edit2, Shield, Smartphone, Check, Eye, Lock, Bell, Download, Database, Fingerprint, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

export const Settings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accent, setAccent] = useState(localStorage.getItem('accent') || 'cobalt');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('accent', accent);
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState(() => {
    const p = JSON.parse(localStorage.getItem('nexus_user') || '{}');
    return { name: p.fullName || '', role: p.bio || '', email: p.email || '', avatar: p.avatarUrl || '' };
  });

  const [editForm, setEditForm] = useState(profile);
  const [readReceipts, setReadReceipts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('http://localhost:5285/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nexus_token')}`
        },
        body: JSON.stringify({ fullName: editForm.name, bio: editForm.role })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
        setProfile({ name: updatedUser.fullName, role: updatedUser.bio, email: updatedUser.email, avatar: updatedUser.avatarUrl });
        setIsEditingProfile(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="header-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)'}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          <span className="brand">NEXUS</span>
        </div>
        <div style={{ width: 24 }}></div>
      </header>

      <div className="settings-content">
        <div className="settings-profile">
          <div className="avatar-wrapper">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" />
            ) : (
              <div className="text-avatar" style={{ width: '100%', height: '100%', fontSize: '24px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {profile.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="online-indicator large"></div>
          </div>
          
          {isEditingProfile ? (
            <div className="profile-edit-form" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                value={editForm.name} 
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <input 
                type="text" 
                value={editForm.role} 
                onChange={e => setEditForm({...editForm, role: e.target.value})}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <input 
                type="email" 
                value={editForm.email} 
                onChange={e => setEditForm({...editForm, email: e.target.value})}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={handleSaveProfile} style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>Save</button>
                <button onClick={() => { setIsEditingProfile(false); setEditForm(profile); }} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-text">
                <h2>{profile.name} <CheckCircleIcon size={16} /></h2>
                <span className="role">@{profile.name.toLowerCase().split(' ')[0]} • {profile.role}</span>
                <span className="email">{profile.email}</span>
              </div>
              <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
                <Edit2 size={16} />
              </button>
            </>
          )}
        </div>

        <div className="status-selector">
          <div className="status-left">
            <div className="status-dot"></div>
            <span>Active • In a flow</span>
          </div>
          <button className="change-btn">Change <ChevronLeft size={16} style={{transform:'rotate(180deg)'}}/></button>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <span>PREFERENCES & APPEARANCE</span>
            <span className="section-tag">THEME_CONFIG</span>
          </div>
          
          <div className="settings-card">
            <div className="setting-row no-border">
              <label>Interface Theme</label>
            </div>
            <div className="theme-options">
              <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                Light
              </button>
              <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                Dark
              </button>
              <button className={`theme-btn ${theme === 'auto' ? 'active' : ''}`} onClick={() => setTheme('auto')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                Auto
              </button>
            </div>

            <div className="setting-row">
              <label>Accent Color</label>
              <span className="accent-name">Electric Cobalt</span>
            </div>
            <div className="color-options">
              <button className={`color-circle ${accent === 'cobalt' ? 'active' : ''}`} style={{backgroundColor: '#1C54E4'}} onClick={() => setAccent('cobalt')}>
                {accent === 'cobalt' && <Check size={16} color="white" />}
              </button>
              <button className="color-circle" style={{backgroundColor: '#10B981'}}></button>
              <button className="color-circle" style={{backgroundColor: '#0EA5E9'}}></button>
              <button className="color-circle" style={{backgroundColor: '#6B7280'}}></button>
              <button className="color-circle" style={{backgroundColor: '#1E3A8A'}}></button>
            </div>

            <div className="setting-row">
              <label>Message Font Scale</label>
              <span className="font-scale-value">Default • 15px</span>
            </div>
            <div className="slider-container">
              <span className="text-small">A</span>
              <input type="range" min="1" max="5" defaultValue="3" className="font-slider" />
              <span className="text-large">A</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <span>PRIVACY & SECURITY</span>
            <Lock size={14} className="section-icon" />
          </div>
          
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-icon bg-blue"><Shield size={20} /></div>
              <div className="setting-info">
                <h4>Two-Factor Authentication</h4>
                <p>Enabled • Authenticator App</p>
              </div>
              <div className="toggle-switch active"></div>
            </div>
            <div className="setting-item">
              <div className="setting-icon"><Smartphone size={20} /></div>
              <div className="setting-info">
                <h4>Active Sessions</h4>
                <p>2 devices (MacBook Pro M3,...</p>
              </div>
              <button className="btn-small">Manage</button>
            </div>
            <div className="setting-item">
              <div className="setting-icon"><Check size={20} /><Check size={20} style={{marginLeft: '-12px'}}/></div>
              <div className="setting-info">
                <h4>Read Receipts</h4>
                <p>Show when you have viewed m...</p>
              </div>
              <div className={`toggle-switch ${readReceipts ? 'active' : ''}`} onClick={() => setReadReceipts(!readReceipts)}></div>
            </div>
            <div className="setting-item no-border">
              <div className="setting-icon"><Eye size={20} /></div>
              <div className="setting-info">
                <h4>Last Seen & Online</h4>
                <p>Visible to your network</p>
              </div>
              <div className="setting-action-text">Contacts Only <ChevronLeft size={16} style={{transform:'rotate(180deg)'}}/></div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <span>NOTIFICATIONS & CHAT</span>
            <Bell size={14} className="section-icon" />
          </div>
          
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-icon"><Bell size={20} /></div>
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Enabled • Sound & Banner alerts</p>
              </div>
              <div className={`toggle-switch ${pushNotifications ? 'active' : ''}`} onClick={() => setPushNotifications(!pushNotifications)}></div>
            </div>
            <div className="setting-item">
              <div className="setting-icon"><Download size={20} /></div>
              <div className="setting-info">
                <h4>Media Auto-Download</h4>
                <p>High-res photos and docu...</p>
              </div>
              <div className="setting-action-text">Wi-Fi only <ChevronLeft size={16} style={{transform:'rotate(180deg)'}}/></div>
            </div>
            <div className="setting-item no-border">
              <div className="setting-icon"><Database size={20} /></div>
              <div className="setting-info">
                <h4>Storage & Data</h4>
                <p>1.4 GB cached</p>
              </div>
              <button className="btn-small">Manage</button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-title">
            <span>DEVICE ACCESS</span>
            <Lock size={14} className="section-icon" />
          </div>
          
          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-icon bg-blue"><Fingerprint size={20} /></div>
              <div className="setting-info">
                <h4>Lock NEXUS with Face ID</h4>
                <p>Require biometric unlock on lau...</p>
              </div>
              <div className="toggle-switch"></div>
            </div>
            
            <button className="logout-btn" onClick={() => {
              localStorage.removeItem('nexus_token');
              localStorage.removeItem('nexus_user');
              window.location.href = '/login';
            }}>
              <LogOut size={18} />
              Log Out of All Devices
            </button>
          </div>
        </div>

        <div className="settings-footer">
          <div className="security-title">
            <Shield size={14} /> End-to-End Encrypted
          </div>
          <p>NEXUS v2.4.1 (Build 8902) • Enterprise Tier</p>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = ({ size = 16, color = "var(--primary)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '4px'}}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
