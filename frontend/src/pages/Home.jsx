import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Cpu, Lock, Terminal } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', paddingTop: '70px', boxSizing: 'border-box' }}>
      <Navbar />
      
      {/* HERO SECTION */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 24px 60px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)', marginBottom: '24px' }}>
          <Terminal style={{ color: '#38bdf8', width: '14px' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#38bdf8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Next-Gen Privacy Architecture</span>
        </div>
        
        <h1 style={{ fontSize: '56px', fontWeight: '850', lineHeight: '1.1', margin: '0 0 24px 0', letterSpacing: '-1.5px', color: '#fff' }}>
          Analyze Complex Documents <br />
          <span style={{ color: '#38bdf8' }}>Completely Offline</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
          Instantly parse, split, and evaluate intelligence parameters inside multi-tenant vector structures using localized AI frameworks. No API leaks. No cloud dependencies.
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/signup')} style={{ height: '52px', padding: '0 32px', borderRadius: '10px', border: 'none', backgroundColor: '#38bdf8', color: '#030712', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
            Launch App Space
          </button>
          <button onClick={() => navigate('/login')} style={{ height: '52px', padding: '0 32px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#111827', color: '#fff', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
            Sign In Securely
          </button>
        </div>
      </div>

      {/* CORE FEATURES GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', boxSizing: 'border-box' }}>
        <div style={{ padding: '32px', borderRadius: '16px', backgroundColor: '#111827', border: '1px solid #1f2937' }}>
          <Cpu style={{ color: '#38bdf8', width: '32px', height: '32px', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0' }}>Isolated RAG Pipelines</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>Strict metadata containment vectors lock searches strictly to the selected active target trace file.</p>
        </div>
        <div style={{ padding: '32px', borderRadius: '16px', backgroundColor: '#111827', border: '1px solid #1f2937' }}>
          <Lock style={{ color: '#38bdf8', width: '32px', height: '32px', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0' }}>Zero Cloud Vector Leaks</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>All extraction mechanics download, fragment, and save direct base64 coordinates straight to machine drive arrays.</p>
        </div>
        <div style={{ padding: '32px', borderRadius: '16px', backgroundColor: '#111827', border: '1px solid #1f2937' }}>
          <Shield style={{ color: '#38bdf8', width: '32px', height: '32px', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0' }}>Multi-Tenant Protection</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>Authenticated sessions isolate individual workspace tracking parameters from structural metadata overlaps.</p>
        </div>
      </div>
    </div>
  );
}