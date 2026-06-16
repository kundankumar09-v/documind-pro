import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (email && password.length >= 6) {
      localStorage.setItem('dm_token', 'mock_jwt_session_handle');
      localStorage.setItem('dm_user_identity', email);
      navigate('/workspace');
    } else {
      setError('Invalid credentials. Please check your email and password.');
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo-icon">
            <Shield size={26} color="var(--brand-accent)" />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-field">
              <Mail size={16} color="var(--text-muted)" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="form-link">Forgot password?</Link>
            </div>
            <div className="input-field">
              <Lock size={16} color="var(--text-muted)" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="alert-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          New to DocuMind?{' '}
          <Link to="/signup" style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}