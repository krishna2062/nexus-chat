import { useState, useEffect } from 'react';
import { ChevronLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

export const Notifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/friends/pending');
        // Map pending requests to notification format
        const mapped = res.data.map((req: any) => ({
          id: req.id,
          type: 'friend_request',
          content: `${req.fullName} sent you a friend request`,
          time: 'Just now', // We don't have created_at on friend requests yet
          avatar: req.avatarUrl,
          fullName: req.fullName,
          unread: true
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className="dashboard-container" style={{ backgroundColor: 'var(--bg-app)' }}>
      <header className="dashboard-header" style={{ display: 'flex' }}>
        <button className="back-btn hidden-lg" onClick={() => navigate(-1)} style={{ marginRight: '16px' }}>
          <ChevronLeft size={24} />
        </button>
        <div className="header-title" style={{ flex: 1 }}>
          <h2>Notifications</h2>
          {notifications.length > 0 && <span className="badge-count">{notifications.length}</span>}
        </div>
      </header>

      <div className="filters" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface)' }}>
        <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-pill ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Unread</button>
      </div>

      <div className="chats-scroll-area" style={{ backgroundColor: 'var(--bg-surface)', flex: 1, borderTop: '1px solid var(--border)' }}>
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
            No new notifications
          </div>
        )}
        {notifications.filter(n => filter === 'all' || (filter === 'unread' && n.unread)).map(notif => (
          <div key={notif.id} className={`chat-item ${notif.unread ? 'active' : ''}`} style={{ alignItems: 'center' }}>
            <div className="chat-avatar-container">
              {notif.avatar ? (
                <img src={notif.avatar} alt="Avatar" className="chat-avatar" />
              ) : (
                <div className="text-avatar" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                  {notif.fullName?.[0] || 'U'}
                </div>
              )}
              {notif.type === 'friend_request' && (
                <div className="online-indicator" style={{ backgroundColor: 'var(--primary)', borderColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
                  <Users size={10} color="white" />
                </div>
              )}
            </div>
            
            <div className="chat-details">
              <div className="chat-name" style={{ fontWeight: notif.unread ? 600 : 500 }}>
                {notif.content}
              </div>
              <div className="chat-time" style={{ marginTop: '4px' }}>{notif.time}</div>
            </div>
            
            {notif.unread && <div className="unread-dot" style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

