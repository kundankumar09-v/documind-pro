import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Key, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password.length >= 6) {
      localStorage.setItem('dm_token', 'mock_jwt_session_handle');
      localStorage.setItem('dm_user_identity', email);
      navigate('/workspace');
    } else {
      setError('Identity reference verification failed. Confirm safety signature parameters.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', margin: 0, padding: 0 }}>
      <Navbar />
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '20px', backgroundColor: '#111827', border: '1px solid #1f2937', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justify_content: 'center', margin: '0 auto', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Shield style={{ color: '#38bdf8', width: '26px' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Welcome Back</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Sign in to continue to your analytics panel</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 14px', height: '46px', boxSizing: 'border-box' }}>
              <User style={{ color: '#4b5563', width: '18px', marginRight: '10px' }} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" style={{ width: '100%', border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: '#38bdf8', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 14px', height: '46px', boxSizing: 'border-box' }}>
              <Key style={{ color: '#4b5563', width: '18px', marginRight: '10px' }} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '16px', flexShrink: 0 }} /> <span>{error}</span>
            </div>
          )}

          <button type="submit" style={{ width: '100%', height: '46px', borderRadius: '10px', border: 'none', backgroundColor: '#38bdf8', color: '#030712', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
            Log In
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #1f2937', paddingTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
          New to the framework? <Link to="/signup" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}