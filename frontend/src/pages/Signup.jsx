import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Key, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Security string signatures do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password metric bounds must equal or exceed 6 parameters.');
      return;
    }
    setSuccess('Profile configuration generated. Redirecting to initialization gate...');
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', margin: 0, padding: 0 }}>
      <Navbar />
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '20px', backgroundColor: '#111827', border: '1px solid #1f2937', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Create Account</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Initialize local isolated workspace variables</p>
        </div>

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 14px', height: '46px', boxSizing: 'border-box' }}>
              <User style={{ color: '#4b5563', width: '18px', marginRight: '10px' }} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" style={{ width: '100%', border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 14px', height: '46px', boxSizing: 'border-box' }}>
              <Key style={{ color: '#4b5563', width: '18px', marginRight: '10px' }} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Confirm Password</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 14px', height: '46px', boxSizing: 'border-box' }}>
              <Key style={{ color: '#4b5563', width: '18px', marginRight: '10px' }} />
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '16px', flexShrink: 0 }} /> <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{success}</span>
            </div>
          )}

          <button type="submit" style={{ width: '100%', height: '46px', borderRadius: '10px', border: 'none', backgroundColor: '#38bdf8', color: '#030712', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #1f2937', paddingTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
          Account profile active? <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}