import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Users, Bell, Settings as SettingsIcon, Hexagon } from 'lucide-react';
import './AppLayout.css';
import { useState, useEffect } from 'react';

const NexusLogo = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="nexusGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="nexusGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="12" fill="url(#nexusGrad1)" />
    <path d="M13 12V28L27 12V28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="27" cy="12" r="2.5" fill="#bfdbfe" />
    <circle cx="13" cy="28" r="2.5" fill="#bfdbfe" />
  </svg>
);

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems: Array<{ id: string, label: string, icon: any, path: string, badge?: string }> = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, path: '/dashboard' },
    { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
    { id: 'friends', label: 'Friends', icon: Users, path: '/friends' },
    { id: 'notifications', label: 'Alerts', icon: Bell, path: '/notifications' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-container">
              <NexusLogo className="logo-icon" size={32} />
              <div className="logo-text">
                <span className="brand-name">NEXUS</span>
                <span className="brand-subtitle">ENTERPRISE</span>
              </div>
            </div>
            <div className="status-dot online"></div>
          </div>
          
          <nav className="sidebar-nav">
            {navItems.map(item => {
              const isActive = location.pathname.includes(item.id) || (item.id === 'chats' && location.pathname === '/dashboard');
              return (
                <button 
                  key={item.id} 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="nav-item-content">
                    <item.icon size={20} />
                    <span>{item.label === 'Alerts' ? 'Notifications' : item.label}</span>
                  </div>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </button>
              );
            })}
          </nav>
          
          <div className="sidebar-footer">
            <div className="profile-btn" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
              <div className="avatar small">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="text-avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                    {user.fullName?.[0] || 'U'}
                  </div>
                )}
                <div className="status-indicator online"></div>
              </div>
              <div className="profile-info">
                <span className="profile-name">{user.fullName || 'User'}</span>
                <span className="profile-status">Active</span>
              </div>
              <SettingsIcon size={16} className="profile-action" />
            </div>
            <div className="gateway-info">
              <span className="status-dot online small"></span>
              Gateway: us-east-mesh.nexus
              <span className="ping">18ms</span>
            </div>
          </div>
        </aside>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && !location.pathname.includes('/call') && (
        <nav className="bottom-nav">
          {navItems.map(item => {
            const isActive = location.pathname.includes(item.id) || (item.id === 'chats' && location.pathname === '/dashboard');
            return (
              <button 
                key={item.id} 
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <div className="icon-wrapper">
                  <item.icon size={24} />
                  {item.badge && <span className="badge-small">{item.badge}</span>}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
