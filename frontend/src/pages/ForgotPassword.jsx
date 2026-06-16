import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-card">
        {!submitted ? (
          <>
            <div className="auth-card-header">
              <div className="auth-logo-icon">
                <Shield size={26} color="var(--brand-accent)" />
              </div>
              <h1>Reset Password</h1>
              <p>Enter your email to receive a secure reset link</p>
            </div>

            <form className="auth-form" onSubmit={handleReset}>
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

              <button type="submit" className="auth-submit-btn">
                Send Reset Instructions
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.10)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={30} color="var(--success)" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
              Instructions Sent
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 0 }}>
              If that email is registered, a password reset link will arrive in your inbox shortly.
            </p>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="form-link">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}