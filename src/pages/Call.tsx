import { useState, useEffect } from 'react';
import { ChevronLeft, UserPlus, MicOff, Mic, Video, VideoOff, MessageSquare, PhoneOff, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Call.css';

export const Call = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  // Fake timer
  const [seconds, setSeconds] = useState(2400); // 40:00

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-container">
      <header className="call-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="call-title">
          <span className="status-dot"></span> Active Call
        </div>
        <div className="header-actions">
          <button className="icon-btn"><UserPlus size={20} /></button>
        </div>
      </header>

      <div className="call-content">
        <div className="main-video">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" alt="Sarah Jenkins" />
          
          <div className="video-overlay top">
            <div className="call-timer">
              <span className="recording-dot"></span>
              {formatTime(seconds)}
            </div>
            <div className="overlay-actions">
              <button className="overlay-btn"><Maximize size={16} /></button>
              <button className="overlay-btn badge">
                <UserPlus size={14} /> 2
              </button>
            </div>
          </div>

          <div className="self-view">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="Self" />
            <span className="self-label">You</span>
          </div>

          <div className="video-overlay bottom info">
            <div className="participant-info">
              <h2>Sarah Jenkins <CheckCircleIcon size={18} color="white" /></h2>
              <div className="quality-badge">HD • 60fps • 12ms</div>
            </div>
            <div className="speaking-indicator">
              <div className="bars">
                <div className="bar"></div><div className="bar"></div><div className="bar"></div>
              </div>
              Sarah is speaking
            </div>
          </div>
        </div>
        
        {/* Call pop up over video */}
        <div className="chat-popup">
          <div className="popup-header">
            <div className="popup-user">
              <div className="avatar-small">SJ</div>
              <span className="name">Sarah Jenkins</span>
            </div>
            <span className="time">just now</span>
            <button className="close-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <p>I've committed the microservices diagram...</p>
        </div>

        <div className="call-controls">
          <button className={`control-btn ${isMuted ? 'danger' : ''}`} onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button className={`control-btn ${!isVideoOn ? 'danger' : ''}`} onClick={() => setIsVideoOn(!isVideoOn)}>
            {!isVideoOn ? <VideoOff size={24} /> : <Video size={24} />}
            <span>Video</span>
          </button>
          <button className="control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10a6 6 0 0 0-12 0c0 4.14-3 7-3 7h18s-3-2.86-3-7z"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span>AirPods</span>
          </button>
          <button className="control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            <span>Share</span>
          </button>
          <button className="control-btn active" onClick={() => navigate('/dashboard')}>
            <div className="icon-with-badge">
              <MessageSquare size={24} />
              <span className="badge-small">5</span>
            </div>
            <span>Chat</span>
          </button>
          <button className="control-btn end-call" onClick={() => navigate('/dashboard')}>
            <PhoneOff size={24} />
            <span>End</span>
          </button>
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
