import { useState, useEffect, useRef } from 'react';
import { Search, Edit, Phone, Video, Info, Paperclip, Smile, Mic, Send, ChevronLeft, MessageSquare, Bell, Check, X, Users } from 'lucide-react';
import './Dashboard.css';
import api from '../services/api';
import { signalRService } from '../services/signalr';

export const Dashboard = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(window.innerWidth >= 1024);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Call State
  const [incomingCall, setIncomingCall] = useState<{from: string, type: string} | null>(null);
  const [activeCall, setActiveCall] = useState<{with: string, type: string, isIncoming: boolean, accepted: boolean} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');

  const fetchChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data);
    } catch (err) {
      console.error('Failed to load chats', err);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get('/friends/pending');
      setPendingRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
      // Mark messages as read
      await api.post(`/chats/${chatId}/read`);
      // Update local unread count
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    
    fetchChats();
    fetchPending();

    signalRService.startChatConnection().then(() => {
      signalRService.chatConnection?.on("ReceiveMessage", (data) => {
        if (data.chatId === selectedChat) {
          setMessages(prev => [...prev, {
            id: data.id || Math.random().toString(),
            text: data.content,
            type: data.type,
            time: new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            incoming: data.senderId !== user.id,
            senderAvatar: data.senderAvatar
          }]);
        }
        fetchChats(); // Refresh chat list
      });

      signalRService.chatConnection?.on("NewFriendRequest", (requester) => {
        setPendingRequests(prev => [...prev, {
          id: requester.id,
          username: requester.username,
          fullName: requester.fullName,
          avatarUrl: requester.avatarUrl
        }]);
        // Optional: show a toast notification here
      });

      signalRService.chatConnection?.on("FriendRequestAccepted", () => {
        fetchChats(); // Refresh chat list to show the new chat
        // Optional: show a toast notification here
      });

      // Call Events
      signalRService.chatConnection?.on("IncomingCall", (fromUser, type) => {
        setIncomingCall({ from: fromUser, type });
      });

      signalRService.chatConnection?.on("CallAnswered", () => {
        setActiveCall(prev => prev ? { ...prev, accepted: true } : null);
      });

      signalRService.chatConnection?.on("CallRejected", () => {
        setActiveCall(null);
        alert("Call was rejected");
      });

      signalRService.chatConnection?.on("CallEnded", () => {
        setActiveCall(null);
        setIncomingCall(null);
      });
    });
    signalRService.startPresenceConnection();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      signalRService.stopAllConnections();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const searchUsers = async (q: string) => {
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

  const sendFriendRequest = async (id: string) => {
    try {
      await api.post(`/friends/request/${id}`);
      alert('Request sent!');
    } catch (err) {
      alert('Failed to send request. Maybe it is already pending?');
    }
  };

  const acceptRequest = async (id: string) => {
    try {
      await api.post(`/friends/accept/${id}`);
      fetchPending();
      fetchChats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // Here you would upload to backend, get URL and send as signalR message type "Image/Video/File"
      // Mocking for now:
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        text: file.name,
        type: file.type.startsWith('image/') ? 1 : file.type.startsWith('video/') ? 2 : 3,
        fileUrl: url,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        incoming: false
      }]);
      if (selectedChat) {
          signalRService.chatConnection?.invoke("SendMessage", selectedChat, file.name, file.type.startsWith('image/') ? 'Image' : 'File')
            .catch(err => console.error(err));
      }
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedChat) return;
    
    signalRService.chatConnection?.invoke("SendMessage", selectedChat, inputValue, "Text")
      .catch(err => console.error(err));
      
    setInputValue('');
  };

  const startCall = (type: 'audio' | 'video') => {
    if (!activeChat) return;
    // activeChat.id might be a chat ID, we need the user ID. 
    // In our simplified mock, we'll use activeChat.id as the target if it's 1on1
    signalRService.chatConnection?.invoke("CallUser", activeChat.id, type);
    setActiveCall({ with: activeChat.id, type, isIncoming: false, accepted: false });
  };

  const answerCall = () => {
    if (!incomingCall) return;
    signalRService.chatConnection?.invoke("AnswerCall", incomingCall.from);
    setActiveCall({ with: incomingCall.from, type: incomingCall.type, isIncoming: true, accepted: true });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    signalRService.chatConnection?.invoke("RejectCall", incomingCall.from);
    setIncomingCall(null);
  };

  const endCall = () => {
    if (activeCall) {
      signalRService.chatConnection?.invoke("EndCall", activeCall.with);
    } else if (incomingCall) {
      signalRService.chatConnection?.invoke("EndCall", incomingCall.from);
    }
    setActiveCall(null);
    setIncomingCall(null);
  };

  const activeChat = chats.find(c => c.id === selectedChat);

  const filteredChats = chats.filter(chat => {
    if (activeFilter === 'unread') return chat.unread > 0;
    if (activeFilter === 'groups') return chat.isGroup;
    return true;
  });

  const renderChatList = () => (
    <div className={`chat-list-panel ${isMobile && selectedChat ? 'hidden' : ''}`}>
      <div className="panel-header">
        <div className="header-title">
          <h2>Chats</h2>
          <span className="badge-count">{filteredChats.length}</span>
        </div>
        <button className="btn-new-chat" onClick={() => setShowNewChatModal(true)}>
          {!isMobile && <span style={{ marginRight: '6px' }}>+</span>}
          {isMobile ? <Edit size={18} /> : 'Search Friends'}
        </button>
      </div>

      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Filter conversations..." />
        <span className="slash-shortcut">/</span>
      </div>

      <div className="filters">
        <button className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
        <button className={`filter-pill ${activeFilter === 'unread' ? 'active' : ''}`} onClick={() => setActiveFilter('unread')}>Unread</button>
        <button className={`filter-pill ${activeFilter === 'groups' ? 'active' : ''}`} onClick={() => setActiveFilter('groups')}>Groups</button>
      </div>

      <div className="chats-scroll-area">
        
        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="active-now-section">
             <div className="section-title" style={{color: 'var(--primary)'}}>
              <span>PENDING REQUESTS</span>
              <span className="online-count">{pendingRequests.length}</span>
            </div>
            {pendingRequests.map(req => (
              <div key={req.id} className="chat-item" style={{justifyContent: 'space-between'}}>
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                   <div className="chat-avatar-container">
                     {req.avatarUrl ? (
                       <img src={req.avatarUrl} alt="Avatar" className="chat-avatar" />
                     ) : (
                       <div className="text-avatar">{req.fullName?.[0] || 'U'}</div>
                     )}
                   </div>
                   <div className="chat-name">{req.fullName}</div>
                </div>
                <div style={{display: 'flex', gap:'8px'}}>
                  <button style={{background:'var(--primary)', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'}} onClick={() => acceptRequest(req.id)}><Check size={16}/></button>
                  <button style={{background:'var(--bg-app)', color:'var(--text-secondary)', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer'}}><X size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredChats.map((chat) => (
          <div 
            key={chat.id} 
            className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
            onClick={() => setSelectedChat(chat.id)}
          >
            <div className="chat-avatar-container">
              {chat.isGroup ? (
                <div className="group-avatar">#</div>
              ) : chat.avatar?.startsWith('http') || chat.avatar?.startsWith('data:') ? (
                <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
              ) : (
                <div className="text-avatar">{chat.name?.[0] || 'U'}</div>
              )}
              {chat.isOnline && <div className="online-indicator"></div>}
            </div>
            <div className="chat-details">
              <div className="chat-header-row">
                <div className="chat-name">{chat.name}</div>
                <span className="chat-time">{new Date(chat.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="chat-message-row">
                <span className={`chat-last-message ${chat.unread > 0 ? 'unread' : ''}`}>
                  {chat.lastMessage || 'No messages yet'}
                </span>
                {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
              </div>
            </div>
          </div>
        ))}
        {filteredChats.length === 0 && <div style={{textAlign:'center', marginTop:'2rem', color:'var(--text-secondary)'}}>No chats found. Search friends to start!</div>}
      </div>
    </div>
  );

  const renderChatThread = () => {
    if (!activeChat) return (
       <div className={`chat-thread-panel ${isMobile && !selectedChat ? 'hidden' : ''}`} style={{display: 'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
             <MessageSquare size={48} style={{opacity: 0.2, marginBottom: '16px'}} />
             <h3>No chat selected</h3>
             <p>Select a chat or find new friends to start messaging.</p>
          </div>
       </div>
    );

    return (
      <div className={`chat-thread-panel ${isMobile && !selectedChat ? 'hidden' : ''} ${isMobile && showContactInfo ? 'hidden' : ''}`}>
        <div className="thread-header">
          <div className="thread-header-left">
            {isMobile && (
              <button className="back-btn" onClick={() => setSelectedChat(null)}>
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="thread-user-info">
              <div className="chat-name large">
                {activeChat.name}
              </div>
              <div className="user-status">
                <span className={`status-dot small ${activeChat.isOnline ? 'online' : ''}`}></span>
                {activeChat.isOnline ? 'Active now' : 'Offline'}
              </div>
            </div>
          </div>
          <div className="thread-actions">
            <button className="action-icon" onClick={() => startCall('audio')}><Phone size={20} /></button>
            <button className="action-icon" onClick={() => startCall('video')}><Video size={20} /></button>
            <button className="action-icon" onClick={() => setShowContactInfo(!showContactInfo)}><Info size={20} /></button>
          </div>
        </div>

        <div className="thread-messages">
          {messages.map((msg, index) => (
            <div key={msg.id || index} className={`message ${msg.incoming ? 'incoming' : 'outgoing'}`}>
              {msg.incoming && <img src={msg.senderAvatar || activeChat.avatar} alt="avatar" className="msg-avatar" />}
              <div className="msg-content">
                {msg.type === 1 || msg.type === 2 || msg.fileUrl ? (
                   <div className="msg-bubble file" style={{ padding: '8px', border: 'none', background: 'transparent' }}>
                      {msg.type === 2 ? (
                         <video src={msg.fileUrl} controls style={{ maxWidth: '240px', borderRadius: '12px' }} />
                      ) : (
                         <img src={msg.fileUrl || 'https://via.placeholder.com/200'} style={{ maxWidth: '240px', borderRadius: '12px' }} alt="sent attachment" />
                      )}
                   </div>
                ) : (
                   <div className={`msg-bubble ${msg.incoming ? '' : 'primary'}`}>
                      {msg.text || msg.content}
                   </div>
                )}
                <span className="msg-time">{msg.time} {!msg.incoming && <Check size={12} color="var(--primary)" />}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="thread-input-area">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
          />
          <button className="input-action" onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={20} />
          </button>
          <button className="input-action"><Smile size={20} /></button>
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Write a message or drop files... (Enter to send)" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
          </div>
          <button className="input-action"><Mic size={20} /></button>
          <button className="send-btn" onClick={handleSendMessage}><Send size={18} /></button>
        </div>
      </div>
    );
  };

  const renderContactInfo = () => {
    if (!activeChat || !showContactInfo) return null;

    return (
      <div className={`contact-info-panel ${isMobile && !showContactInfo ? 'hidden' : ''}`}>
        <div className="panel-header info-header">
          {isMobile && (
            <button className="back-btn" onClick={() => setShowContactInfo(false)}>
              <ChevronLeft size={24} />
            </button>
          )}
          <h2>Contact Info</h2>
          <button className="close-btn" onClick={() => setShowContactInfo(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="info-scroll-area">
          <div className="info-profile">
            <div className="avatar-large-container">
              <img src={activeChat.avatar || 'https://via.placeholder.com/150'} alt={activeChat.name} className="avatar-large" />
              {activeChat.isOnline && <div className="online-indicator large"></div>}
            </div>
            <h3 className="info-name">{activeChat.name}</h3>
            <p className="info-bio">{activeChat.bio || 'Hey there! I am using Nexus Chat.'}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {!isMobile && (
        <header className="dashboard-header">
          <div className="global-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search across app..." />
          </div>
          <div className="header-right">
            <button className="btn-primary btn-new-chat-header" onClick={() => setShowNewChatModal(true)}>
              <span>+</span> Find Friends
            </button>
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              {pendingRequests.length > 0 && <span className="notification-dot"></span>}
            </button>
            <div className="header-profile" onClick={() => {
              window.location.href = '/settings';
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.fullName || 'User'}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Settings</span>
              </div>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="text-avatar" style={{ width: '36px', height: '36px', fontSize: '14px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="dashboard-content">
        {renderChatList()}
        {renderChatThread()}
        {renderContactInfo()}
      </div>

      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Search Friends</h3>
              <button className="close-btn" onClick={() => setShowNewChatModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="search-container" style={{ margin: '16px', backgroundColor: 'var(--bg-app)' }}>
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search by name, username..." value={searchQuery} onChange={(e) => searchUsers(e.target.value)} />
            </div>
            <div className="modal-body" style={{ padding: '0 16px 16px', maxHeight: '300px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>SEARCH RESULTS</p>
              {searchResults.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No users found.</p>}
              {searchResults.map(u => (
                <div key={u.id} className="chat-item" style={{ padding: '8px 0', border: 'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                     <div className="chat-avatar-container">
                       {u.avatarUrl ? <img src={u.avatarUrl} alt={u.fullName} className="chat-avatar" /> : <div className="text-avatar">{u.fullName[0]}</div>}
                     </div>
                     <div className="chat-details">
                       <div className="chat-name">{u.fullName}</div>
                       <div className="chat-last-message">@{u.username}</div>
                     </div>
                  </div>
                  <button style={{background:'var(--primary)', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'13px'}} onClick={() => sendFriendRequest(u.id)}>Add Friend</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Call Modals */}
      {incomingCall && (
        <div className="modal-overlay">
          <div className="modal-content" style={{textAlign: 'center', padding: '32px'}}>
             <div className="avatar-large-container" style={{margin: '0 auto 16px'}}>
                <div className="text-avatar" style={{width: '64px', height: '64px', fontSize: '24px'}}>{incomingCall.from[0] || 'U'}</div>
             </div>
             <h3>Incoming {incomingCall.type} call...</h3>
             <p style={{color: 'var(--text-secondary)'}}>from {incomingCall.from}</p>
             <div style={{display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px'}}>
                <button style={{background: 'var(--error)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}} onClick={rejectCall}>
                   <Phone size={18} style={{transform: 'rotate(135deg)'}} /> Decline
                </button>
                <button style={{background: 'var(--success)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}} onClick={answerCall}>
                   <Phone size={18} /> Answer
                </button>
             </div>
          </div>
        </div>
      )}

      {activeCall && (
         <div className="modal-overlay" style={{backgroundColor: 'rgba(0,0,0,0.9)'}}>
           <div className="modal-content" style={{background: 'transparent', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'center'}}>
              <h2 style={{color: 'white', marginBottom: '24px'}}>{activeCall.accepted ? 'In Call' : 'Calling...'}</h2>
              
              <div style={{position: 'relative', width: '100%', maxWidth: '600px', aspectRatio: '16/9', backgroundColor: '#111', borderRadius: '16px', overflow: 'hidden'}}>
                 {activeCall.type === 'video' ? (
                   <>
                     {/* Remote Video Mock */}
                     <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                        <Users size={48} opacity={0.2} />
                        <span style={{position: 'absolute', bottom: '16px', left: '16px'}}>{activeCall.with}</span>
                     </div>
                     {/* Local Video Mock */}
                     <div style={{position: 'absolute', bottom: '16px', right: '16px', width: '120px', height: '160px', backgroundColor: '#333', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)'}}>
                        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>You</div>
                     </div>
                   </>
                 ) : (
                   <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                      <div className="text-avatar" style={{width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px'}}>{activeCall.with[0] || 'U'}</div>
                      <h3>{activeCall.with}</h3>
                      <p style={{color: 'var(--text-secondary)'}}>{activeCall.accepted ? '00:01' : 'Ringing...'}</p>
                   </div>
                 )}
              </div>

              <div style={{display: 'flex', gap: '24px', marginTop: '32px'}}>
                 <button style={{width: '56px', height: '56px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Mic size={24} /></button>
                 {activeCall.type === 'video' && <button style={{width: '56px', height: '56px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Video size={24} /></button>}
                 <button style={{width: '56px', height: '56px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--error)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={endCall}><Phone size={24} style={{transform: 'rotate(135deg)'}} /></button>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};
