import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dm_token');

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: '70px', backgroundColor: '#090d16', borderBottom: '1px solid #1f2937', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, boxSizing: 'border-box' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Shield style={{ color: '#38bdf8', width: '26px', height: '26px' }} />
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>DocuMind</span>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {token ? (
          <button onClick={() => navigate('/workspace')} style={{ height: '40px', padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#030712', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
            Go to Workspace
          </button>
        ) : (
          <>
            <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Log In</Link>
            <button onClick={() => navigate('/signup')} style={{ height: '40px', padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#030712', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}