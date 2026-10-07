import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import './Auth.css';

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

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        usernameOrEmail,
        password
      });

      // Save token and user details
      localStorage.setItem('nexus_token', response.data.token);
      localStorage.setItem('nexus_user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <NexusLogo size={56} className="mb-4" />
        <h1>Log in to NEXUS</h1>
        <p>Enter your credentials to access your workspaces & conversations.</p>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="form-group">
          <div className="label-row">
            <label>Username or Email</label>
            <span className="label-hint">nexus_id</span>
          </div>
          <div className="input-wrapper">
            <span className="input-icon">@</span>
            <input 
              type="text" 
              placeholder="username or name@domain.com" 
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="label-row">
            <label>Password</label>
            <Link to="#" className="forgot-password">Forgot password?</Link>
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
            />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <label className="checkbox-container">
          <input type="checkbox" defaultChecked />
          <span className="checkmark"></span>
          Remember me on this device
        </label>

        <button type="submit" className="btn-primary btn-large" disabled={isLoading}>
          {isLoading ? 'Logging In...' : 'Log In'}
          {!isLoading && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
        </button>

        <div className="divider">
          <span>OR CONNECT WITH</span>
        </div>

        <div className="social-login">
          <button type="button" className="btn-secondary">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button type="button" className="btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#0F4C81'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Sign In with SSO / Passkey
          </button>
        </div>
      </form>

      <div className="auth-footer">
        <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        <div className="security-badge">
          <ShieldCheck size={16} className="text-success" />
          <span>256-BIT END-TO-END ENCRYPTED LOGIN</span>
        </div>
      </div>
    </div>
  );
};
