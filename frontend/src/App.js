import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from './components/ui/sonner';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = useCallback((token, user) => {
    setToken(token);
    setUser(user);
    // NOTE: Using localStorage for tokens. In production, consider:
    // 1. HttpOnly cookies for better XSS protection
    // 2. Shorter token expiry with refresh token mechanism
    // 3. Additional XSS protections (CSP headers, input sanitization)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const renderRoute = () => {
    if (!token) {
      return <AuthPage onLogin={handleLogin} />;
    }
    
    if (user?.is_admin) {
      return <AdminDashboard user={user} token={token} onLogout={handleLogout} />;
    }
    
    return <UserDashboard user={user} token={token} onLogout={handleLogout} />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={renderRoute()} />
          <Route path="/dashboard" element={token && user && !user.is_admin ? <UserDashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/admin" element={token && user && user.is_admin ? <AdminDashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
