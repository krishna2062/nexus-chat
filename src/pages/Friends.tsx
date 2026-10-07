import { useState, useEffect } from 'react';
import { Search, ChevronLeft, UserPlus, Check, X, Clock, UserCheck, Phone, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import api from '../services/api';

export const Friends = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'add'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriends(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get('/friends/pending');
      setPendingRequests(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?query=${q}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async (id: string) => {
    try {
      await api.post(`/friends/request/${id}`);
      setSearchResults(results => 
        results.map(user => user.id === id ? { ...user, status: 'sent' } : user)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await api.post(`/friends/accept/${id}`);
      fetchPending();
      fetchFriends();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineRequest = (id: string) => {
    // optional API
    setPendingRequests(reqs => reqs.filter(req => req.id !== id));
  };

  return (
    <div className="dashboard-container" style={{ backgroundColor: 'var(--bg-app)' }}>
      <header className="dashboard-header" style={{ display: 'flex' }}>
        <button className="back-btn hidden-lg" onClick={() => navigate(-1)} style={{ marginRight: '16px' }}>
          <ChevronLeft size={24} />
        </button>
        <div className="header-title" style={{ flex: 1 }}>
          <h2>Friends</h2>
        </div>
      </header>

      <div className="filters" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
        <button className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>My Friends {friends.length}</button>
        <button className={`filter-pill ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending {pendingRequests.length > 0 && <span className="pill-badge">{pendingRequests.length}</span>}</button>
        <button className={`filter-pill ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>Add Friend</button>
      </div>

      <div className="chats-scroll-area" style={{ backgroundColor: 'var(--bg-surface)', flex: 1 }}>
        {activeTab === 'add' && (
          <div style={{ padding: '20px' }}>
            <div className="search-container" style={{ margin: '0 0 20px 0' }}>
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by username..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {searchResults.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-app)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="chat-avatar-container">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                      ) : (
                        <div className="text-avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {user.fullName?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>@{user.username}</div>
                    </div>
                  </div>
                  {user.status === 'none' || user.status == null ? (
                    <button onClick={() => handleSendRequest(user.id)} style={{ background: 'var(--primary)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}>
                      <UserPlus size={16} /> Add
                    </button>
                  ) : (
                    <button style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px' }} disabled>
                      <Clock size={16} /> Sent
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div style={{ padding: '20px' }}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="chat-avatar-container">
                      {req.avatarUrl ? (
                        <img src={req.avatarUrl} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                      ) : (
                        <div className="text-avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {req.fullName?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{req.fullName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>@{req.username}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAcceptRequest(req.id)} style={{ background: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                    <Check size={18} />
                  </button>
                  <button onClick={() => handleDeclineRequest(req.id)} style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>No pending requests</div>}
          </div>
        )}

        {activeTab === 'all' && (
          <div style={{ padding: '20px' }}>
            <div className="search-container" style={{ margin: '0 0 20px 0' }}>
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search friends..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map(friend => (
                <div key={friend.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-app)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="chat-avatar-container">
                      {friend.avatarUrl ? (
                        <img src={friend.avatarUrl} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                      ) : (
                        <div className="text-avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {friend.fullName?.[0] || 'U'}
                        </div>
                      )}
                      {friend.isOnline && <div className="online-indicator large"></div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{friend.fullName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>@{friend.username}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <UserCheck size={16} />
                    </button>
                    <button onClick={() => navigate('/calls')} style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <Phone size={16} />
                    </button>
                    <button onClick={() => navigate('/calls')} style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <Video size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
