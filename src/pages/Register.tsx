import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import './Auth.css';
import './AuthRegister.css';

const NexusLogo = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="nexusGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="12" fill="url(#nexusGrad1)" />
    <path d="M13 12V28L27 12V28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="27" cy="12" r="2.5" fill="#bfdbfe" />
    <circle cx="13" cy="28" r="2.5" fill="#bfdbfe" />
  </svg>
);

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!avatarBase64) {
      setError('Profile picture is required. Please upload one.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName,
        username,
        email,
        password,
        avatarBase64
      });

      // Save token and user details
      localStorage.setItem('nexus_token', response.data.token);
      localStorage.setItem('nexus_user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header-text" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <NexusLogo size={48} className="mb-4" />
        <h1 style={{ fontSize: '24px' }}>Create an Account</h1>
        <p>Join the NEXUS communication network</p>
      </div>

      <div className="photo-upload" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg, image/png" 
          style={{ display: 'none' }} 
        />
        <div className="photo-circle" style={{ overflow: 'hidden', backgroundColor: avatarBase64 ? 'transparent' : 'var(--bg-app)' }}>
          {avatarBase64 ? (
            <img src={avatarBase64} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-secondary)'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          )}
          <div className="upload-badge">
            <Camera size={12} color="white" />
          </div>
        </div>
        <span className="upload-title">{avatarBase64 ? 'Change Photo' : 'Upload Photo'}</span>
        <span className="upload-subtitle">JPG, PNG up to 5MB (Required)</span>
      </div>

      <form className="auth-form" onSubmit={handleRegister}>
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="form-group">
          <div className="label-row">
            <label>Full Name</label>
          </div>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </span>
            <input 
              type="text" 
              placeholder="Elena Rostova" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="label-row">
            <label>Username</label>
            <span className="label-hint" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Available
            </span>
          </div>
          <div className="input-wrapper">
            <span className="input-icon">@</span>
            <input 
              type="text" 
              placeholder="elena_r" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {username.length > 2 && (
              <span className="input-status-icon text-success">
                <CheckCircle2 size={18} />
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="label-row">
            <label>Work Email</label>
          </div>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            <input 
              type="email" 
              placeholder="elena@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="label-row">
            <label>Password</label>
          </div>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="security-strength">
          <div className="strength-header">
            <span className="strength-label">Security Strength</span>
            <span className="strength-status text-success">• Strong</span>
          </div>
          <div className="strength-bars">
            <div className="bar active"></div>
            <div className="bar active"></div>
            <div className="bar active"></div>
            <div className="bar active"></div>
          </div>
        </div>

        <label className="checkbox-container" style={{ alignItems: 'flex-start' }}>
          <input type="checkbox" defaultChecked />
          <span className="checkmark" style={{ marginTop: '2px' }}></span>
          <span style={{ fontSize: '13px' }}>I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link></span>
        </label>

        <button type="submit" className="btn-primary btn-large" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
          {!isLoading && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
        </button>

        <div className="divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <button type="button" className="btn-secondary">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </form>

      <div className="auth-footer" style={{ marginTop: '24px' }}>
        <p>Already have an account? <Link to="/login">Log In</Link></p>
      </div>
    </div>
  );
};
