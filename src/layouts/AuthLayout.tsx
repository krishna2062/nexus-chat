import { Outlet } from 'react-router-dom';
import { Hexagon } from 'lucide-react';
import './AuthLayout.css';

export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <button className="back-button">
          {/* Using a simple arrow since we don't have routing back yet */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="auth-logo">
          <Hexagon className="logo-icon" size={24} fill="currentColor" />
          <span className="brand-name">NEXUS</span>
        </div>
        <div style={{ width: 24 }}></div>
      </header>
      
      <main className="auth-content">
        <div className="gateway-badge">
          <span className="status-dot"></span>
          ENTERPRISE GATEWAY
        </div>
        
        <Outlet />
      </main>
    </div>
  );
};
