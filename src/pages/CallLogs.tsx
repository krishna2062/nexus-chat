import { useState } from 'react';
import { Phone, Video, Search, ChevronLeft, PhoneMissed, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const mockCalls = [
  { id: 1, name: 'Sarah Jenkins', type: 'video', direction: 'incoming', status: 'missed', time: '10:30 AM', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 2, name: 'Marcus Chen', type: 'audio', direction: 'outgoing', status: 'completed', duration: '12:45', time: 'Yesterday', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 3, name: 'Alex Rivera', type: 'video', direction: 'incoming', status: 'completed', duration: '45:20', time: 'Monday', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: 4, name: 'Sprint 42 Staging', type: 'audio', direction: 'incoming', status: 'completed', duration: '1:05:00', time: 'Oct 22', isGroup: true, avatar: '#' },
];

export const CallLogs = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  return (
    <div className="dashboard-container" style={{ backgroundColor: 'var(--bg-app)' }}>
      <header className="dashboard-header" style={{ display: 'flex' }}>
        <button className="back-btn hidden-lg" onClick={() => navigate(-1)} style={{ marginRight: '16px' }}>
          <ChevronLeft size={24} />
        </button>
        <div className="header-title" style={{ flex: 1 }}>
          <h2>Calls</h2>
        </div>
        <div className="header-right">
          <button className="icon-btn"><Search size={20} /></button>
          <button className="icon-btn"><Phone size={20} /></button>
        </div>
      </header>

      <div className="filters" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface)' }}>
        <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-pill ${filter === 'missed' ? 'active' : ''}`} onClick={() => setFilter('missed')}>Missed</button>
      </div>

      <div className="chats-scroll-area" style={{ backgroundColor: 'var(--bg-surface)', flex: 1, borderTop: '1px solid var(--border)' }}>
        {mockCalls.filter(c => filter === 'all' || c.status === filter).map(call => (
          <div key={call.id} className="chat-item" style={{ alignItems: 'center' }}>
            <div className="chat-avatar-container">
              {call.isGroup ? (
                <div className="group-avatar">#</div>
              ) : (
                <img src={call.avatar} alt={call.name} className="chat-avatar" />
              )}
            </div>
            
            <div className="chat-details">
              <div className="chat-header-row">
                <div className="chat-name" style={{ color: call.status === 'missed' ? 'var(--error)' : 'var(--text-primary)' }}>
                  {call.name}
                </div>
                <span className="chat-time">{call.time}</span>
              </div>
              <div className="chat-message-row" style={{ gap: '6px', justifyContent: 'flex-start' }}>
                {call.status === 'missed' ? (
                  <PhoneMissed size={14} color="var(--error)" />
                ) : call.direction === 'incoming' ? (
                  <PhoneIncoming size={14} color="var(--text-secondary)" />
                ) : (
                  <PhoneOutgoing size={14} color="var(--text-secondary)" />
                )}
                
                <span className="chat-last-message">
                  {call.type === 'video' ? 'Video Call' : 'Audio Call'}
                  {call.duration && ` • ${call.duration}`}
                </span>
              </div>
            </div>

            <div className="call-actions" style={{ display: 'flex', gap: '12px', marginLeft: '12px' }}>
              <button style={{ color: 'var(--primary)' }}>
                {call.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
              </button>
              <button style={{ color: 'var(--text-secondary)' }}>
                <InfoIcon size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InfoIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
