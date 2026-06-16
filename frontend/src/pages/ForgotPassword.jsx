import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', margin: 0, padding: 0 }}>
      <Navbar />
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '20px', backgroundColor: '#111827', border: '1px solid #1f2937', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
        
        {!submitted ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Reset Password</h1>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Enter email to request a secure link</p>
            </div>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '0 14px', height: '46px', boxSizing: 'border-box' }}>
                  <User style={{ color: '#4b5563', width: '18px', marginRight: '10px' }} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" style={{ width: '100%', border: 'none', backgroundColor: 'transparent', color: '#fff', outline: 'none' }} />
                </div>
              </div>
              <button type="submit" style={{ width: '100%', height: '46px', borderRadius: '10px', border: 'none', backgroundColor: '#38bdf8', color: '#030712', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                Send Recovery Instructions
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle style={{ color: '#34d399', width: '48px', height: '48px', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 10px 0' }}>Instructions Dispatched</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 24px 0' }}>If the address targets an activated metric profile, a reset token layout link will appear shortly.</p>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #1f2937', paddingTop: '16px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>Return to Login Gate</Link>
        </div>
      </div>
    </div>
  );
}