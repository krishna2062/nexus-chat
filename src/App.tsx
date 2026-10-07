import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { CallLogs } from './pages/CallLogs';
import { Friends } from './pages/Friends';
import { Notifications } from './pages/Notifications';

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('nexus_token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const isAuthenticated = !!localStorage.getItem('nexus_token');
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calls" element={<CallLogs />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
