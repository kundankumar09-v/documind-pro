import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MessageSquare, Shield, Send, Loader, LogOut, FileText, Sparkles, Plus, Trash2, Files } from 'lucide-react';

export default function Workspace() {
  const navigate = useNavigate();
  const identityReference = localStorage.getItem('dm_user_identity') || 'user@domain.com';
  const username = identityReference.split('@')[0];
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('dm_token')) navigate('/login');
  }, [navigate]);

  // ChatGPT State Management Core
  const [sessions, setSessions] = useState([]); 
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load chat memory from browser storage on initial boot
  useEffect(() => {
    const savedSessions = localStorage.getItem(`dm_sessions_${username}`);
    const savedFiles = localStorage.getItem(`dm_files_${username}`);
    
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      const normalized = parsed.map((session) => ({ ...session, files: session.files || [] }));
      setSessions(normalized);
      if (normalized.length > 0) {
        setActiveSessionId(normalized[0].id); // Default load the most recent chat session
      }
    } else {
      // If zero history exists, clear a space and seed an initial pristine chat session
      const initialId = 'sess_' + Date.now();
      const defaultSess = [{ id: initialId, title: 'New Chat Session', history: [], files: [] }];
      setSessions(defaultSess);
      setActiveSessionId(initialId);
      localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(defaultSess));
    }

    if (savedFiles) setUploadedFiles(JSON.parse(savedFiles));
  }, [username]);

  // Force synchronizing variables directly to disk storage
  const saveAndSyncSessions = (updatedSessions) => {
    setSessions(updatedSessions);
    localStorage.setItem(`dm_sessions_${username}`, JSON.stringify(updatedSessions));
  };

  // Smooth scroll to tracking anchor
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, loadingAnswer]);

  // Dynamically find and single out the conversation history array matching the clicked link
  const activeSession = sessions.find(s => s.id === activeSessionId) || { id: '', title: '', history: [], files: [] };

  const handleCreateNewChat = () => {
    // Don't clutter the sidebar with multiple blank sessions
    const hasBlankActive = sessions.some(s => s.history.length === 0);
    if (hasBlankActive && sessions.length > 0) {
      const firstBlank = sessions.find(s => s.history.length === 0);
      setActiveSessionId(firstBlank.id);
      return;
    }

    const newId = 'sess_' + Date.now();
    const cleanSessions = [{ id: newId, title: 'New Chat Session', history: [], files: [] }, ...sessions];
    saveAndSyncSessions(cleanSessions);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (idToDelete, e) => {
    e.stopPropagation(); // Stop click from trying to select the chat while deleting it
    const remaining = sessions.filter(s => s.id !== idToDelete);
    
    if (remaining.length === 0) {
      const newId = 'sess_' + Date.now();
      saveAndSyncSessions([{ id: newId, title: 'New Chat Session', history: [], files: [] }]);
      setActiveSessionId(newId);
    } else {
      saveAndSyncSessions(remaining);
      if (activeSessionId === idToDelete) {
        setActiveSessionId(remaining[0].id); // Focus on next adjacent chat item
      }
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files?.[0]) return;
    const targets = Array.from(e.target.files);
    setUploading(true);

    for (const targetFile of targets) {
      const formData = new FormData();
      formData.append('file', targetFile);
      formData.append('session_id', activeSessionId);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const freshFileList = [...new Set([...uploadedFiles, targetFile.name])];
          setUploadedFiles(freshFileList);
          localStorage.setItem(`dm_files_${username}`, JSON.stringify(freshFileList));
          const nextSessions = sessions.map((session) =>
            session.id === activeSessionId
              ? { ...session, files: Array.from(new Set([...(session.files || []), targetFile.name])) }
              : session
          );
          saveAndSyncSessions(nextSessions);
        }
      } catch (err) {
        console.error("Payload transmission mismatch.", err);
      }
    }
    setUploading(false);
  };

  // Drag & Drop Handlers for Premium Upload Interface
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
      }
    }
  };

  const handleProcessDocument = async () => {
    if (selectedFile && activeSessionId) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('session_id', activeSessionId);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const freshFileList = [...new Set([...uploadedFiles, selectedFile.name])];
          setUploadedFiles(freshFileList);
          localStorage.setItem(`dm_files_${username}`, JSON.stringify(freshFileList));
          const nextSessions = sessions.map((session) =>
            session.id === activeSessionId
              ? { ...session, files: Array.from(new Set([...(session.files || []), selectedFile.name])) }
              : session
          );
          saveAndSyncSessions(nextSessions);
          setSelectedFile(null);
        }
      } catch (err) {
        console.error("Document processing failed.", err);
      }
      setUploading(false);
    }
  };

  const handleChatSubmission = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userPrompt = question;
    setQuestion('');
    setLoadingAnswer(true);

    // 1. Instantly append user's prompt bubble to the current active session
    const updatedHistory = [...activeSession.history, { role: 'user', text: userPrompt }];
    
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        // Dynamic Naming: Switch title from 'New Chat Session' to the actual text of your first query
        const updatedTitle = s.title === 'New Chat Session' ? (userPrompt.length > 22 ? userPrompt.slice(0, 22) + '...' : userPrompt) : s.title;
        return { ...s, title: updatedTitle, history: updatedHistory };
      }
      return s;
    });
    
    saveAndSyncSessions(updatedSessions);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userPrompt, session_id: activeSessionId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // 2. Append AI model response bubble to this specific session trail
        const completeHistory = [...updatedHistory, { role: 'assistant', text: data.answer, citations: data.citations }];
        const syncModelSessions = sessions.map(s => s.id === activeSessionId ? { ...s, history: completeHistory } : s);
        saveAndSyncSessions(syncModelSessions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Advanced Markdown parsing with smart keyword detection
  const TECHNICAL_KEYWORDS = [
    'Machine Learning', 'ML', 'Deep Learning', 'Neural Network', 'NLP', 'LLM', 'RAG',
    'Vector', 'Embedding', 'Semantic', 'Retrieval', 'Augmented', 'Generation',
    'FastAPI', 'Docker', 'Python', 'JavaScript', 'React', 'Node.js', 'PostgreSQL',
    'MongoDB', 'Redis', 'AWS', 'GCP', 'Azure', 'Kubernetes', 'Microservices',
    'REST API', 'GraphQL', 'WebSocket', 'OAuth', 'JWT', 'HTTPS',
    'Retail', 'Analytics', 'Dashboard', 'Platform', 'E-commerce', 'Inventory',
    'OCR', 'Document', 'PDF', 'Parsing', 'Extraction', 'Classification',
    'RoBERTa', 'BERT', 'GPT', 'Transformer', 'Attention', 'Tokenization',
    'Database', 'Cache', 'Queue', 'Message Broker', 'Stream', 'Pipeline',
    'Optimization', 'Performance', 'Scalability', 'Reliability', 'Latency',
    'API', 'Endpoint', 'Authentication', 'Authorization', 'Permission',
    'Framework', 'Library', 'Package', 'Dependency', 'Module', 'Component',
  ];

  const smartHighlightText = (text) => {
    if (!text) return text;
    
    let result = text;
    for (const keyword of TECHNICAL_KEYWORDS) {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      result = result.replace(regex, `**$1**`);
    }
    return result;
  };

  const formatMarkdownText = (rawText) => {
    if (!rawText) return '';

    const lines = rawText.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`empty-${i}`} style={{ height: '8px' }} />);
        i++;
        continue;
      }

      // Parse headers (###, ##, #)
      if (trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^###\s*/, '').trim();
        elements.push(
          <h4
            key={`h4-${i}`}
            style={{
              fontSize: 'clamp(13px, 2vw, 15px)',
              fontWeight: '700',
              color: '#00f0ff',
              marginTop: '16px',
              marginBottom: '12px',
              letterSpacing: '0.3px',
              textTransform: 'capitalize',
            }}
          >
            {headerText}
          </h4>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('##')) {
        const headerText = trimmed.replace(/^##\s*/, '').trim();
        elements.push(
          <h3
            key={`h3-${i}`}
            style={{
              fontSize: 'clamp(14px, 2.2vw, 16px)',
              fontWeight: '800',
              color: '#0e74fd',
              marginTop: '18px',
              marginBottom: '14px',
              letterSpacing: '0.4px',
            }}
          >
            {headerText}
          </h3>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('#') && !trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^#\s*/, '').trim();
        elements.push(
          <h2
            key={`h2-${i}`}
            style={{
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              fontWeight: '800',
              background: 'linear-gradient(to right, #0e74fd, #00f0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '20px',
              marginBottom: '16px',
              letterSpacing: '0.5px',
            }}
          >
            {headerText}
          </h2>
        );
        i++;
        continue;
      }

      // Parse numbered lists (1., 2., etc.)
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^\d+\.\s(.+)$/);
        if (match) {
          const content = smartHighlightText(match[1]);
          const parts = content.split(/\*\*([\s\S]*?)\*\*/g);
          elements.push(
            <div
              key={`ol-${i}`}
              style={{
                marginBottom: '10px',
                paddingLeft: '28px',
                color: '#e2e8f0',
                fontSize: 'clamp(13px, 2vw, 15px)',
                lineHeight: '1.75',
                letterSpacing: '0.15px',
                display: 'list-item',
                listStyleType: 'decimal',
                listStylePosition: 'outside',
              }}
            >
              {parts.map((part, idx) =>
                idx % 2 === 1 ? (
                  <span
                    key={idx}
                    style={{
                      background: 'linear-gradient(to right, #00f0ff, #38bdf8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '700',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {part}
                  </span>
                ) : (
                  <span key={idx}>{part}</span>
                )
              )}
            </div>
          );
          i++;
          continue;
        }
      }

      // Parse bullet points (*)
      if (trimmed.startsWith('*')) {
        const content = smartHighlightText(trimmed.replace(/^\*\s*/, ''));
        const parts = content.split(/\*\*([\s\S]*?)\*\*/g);
        elements.push(
          <div
            key={`li-${i}`}
            style={{
              marginBottom: '10px',
              paddingLeft: '24px',
              color: '#e2e8f0',
              fontSize: 'clamp(13px, 2vw, 15px)',
              lineHeight: '1.75',
              letterSpacing: '0.15px',
              display: 'list-item',
              listStyleType: 'disc',
              listStylePosition: 'outside',
            }}
          >
            {parts.map((part, idx) =>
              idx % 2 === 1 ? (
                <span
                  key={idx}
                  style={{
                    background: 'linear-gradient(to right, #00f0ff, #38bdf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                  }}
                >
                  {part}
                </span>
              ) : (
                <span key={idx}>{part}</span>
              )
            )}
          </div>
        );
        i++;
        continue;
      }

      // Parse regular paragraphs with smart keyword highlighting
      const enhancedLine = smartHighlightText(trimmed);
      const parts = enhancedLine.split(/\*\*([\s\S]*?)\*\*/g);
      elements.push(
        <p
          key={`p-${i}`}
          style={{
            marginBottom: '14px',
            color: '#e2e8f0',
            fontSize: 'clamp(13px, 2vw, 15px)',
            lineHeight: '1.75',
            letterSpacing: '0.15px',
            margin: '0 0 14px 0',
          }}
        >
          {parts.map((part, idx) =>
            idx % 2 === 1 ? (
              <span
                key={idx}
                style={{
                  background: 'linear-gradient(to right, #00f0ff, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '700',
                  letterSpacing: '0.3px',
                }}
              >
                {part}
              </span>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </p>
      );
      i++;
    }

    return <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>{elements}</div>;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#030712', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0, boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* SIDEBAR SYSTEM (CHATGPT LAYOUT) */}
      <div style={{ width: '280px', minWidth: '280px', borderRight: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: '#0b0f19', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100% - 60px)' }}>
          
          {/* NEW CHAT CONSOLE BUTTON */}
          <button onClick={handleCreateNewChat} style={{ width: '100%', height: '44px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', transition: 'all 0.2s' }} className="new-chat-btn">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare style={{ width: '16px', color: '#38bdf8' }} /> New Chat</span>
            <Plus style={{ width: '16px', color: '#64748b' }} />
          </button>

          {/* PERSISTENT SIDEBAR RECENT CHAT SESSION LINKS */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.5px', paddingLeft: '8px', textTransform: 'uppercase', marginBottom: '6px' }}>Chat History</span>
            
            {sessions.map(sess => (
              <div 
                key={sess.id} 
                onClick={() => setActiveSessionId(sess.id)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0 12px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  backgroundColor: sess.id === activeSessionId ? 'rgba(255,255,255,0.05)' : 'transparent', 
                  border: sess.id === activeSessionId ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  transition: 'background-color 0.15s'
                }} 
                className="session-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <MessageSquare style={{ width: '14px', color: sess.id === activeSessionId ? '#38bdf8' : '#475569', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: sess.id === activeSessionId ? '#fff' : '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {sess.title}
                  </span>
                </div>
                <Trash2 onClick={(e) => handleDeleteSession(sess.id, e)} style={{ width: '14px', color: '#64748b', opacity: sess.id === activeSessionId ? 1 : 0, transition: 'opacity 0.15s' }} className="trash-icon" />
              </div>
            ))}
          </div>

          {/* MULTI-DOCUMENT KNOWLEDGE FILE POOL */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => document.getElementById('premium-upload-trigger')?.click()}
              style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.3)', backgroundColor: 'rgba(0, 240, 255, 0.08)', color: '#00f0ff', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
              <Upload style={{ width: '14px' }} />
              Upload Document
            </button>
            
            {uploadedFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Session Files</span>
                <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {uploadedFiles.map((fName, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.02)', fontSize: '11px', color: '#94a3b8' }}>
                      <FileText style={{ width: '10px', flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{fName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div style={{ height: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>@{username}</span>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}><LogOut style={{ width: '16px' }} /></button>
        </div>
      </div>

      {/* CHAT BOX CONTAINER DISPLAY (PREMIUM HYPER-DYNAMIC WORKSPACE) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse at 60% 40%, rgba(14, 116, 253, 0.03) 0%, #05070f 80%)', position: 'relative', overflow: 'hidden' }}>
        
        {/* PREMIUM DOCUMENT UPLOAD INTERFACE */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: selectedFile ? 'rgba(5, 7, 15, 0.95)' : 'transparent', backdropFilter: selectedFile ? 'blur(8px)' : 'none', zIndex: selectedFile ? 9 : -1, transition: 'all 0.3s ease', pointerEvents: selectedFile ? 'auto' : 'none', flexDirection: 'column', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px', animation: selectedFile ? 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }}>
            {/* Header Branding Block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(14, 116, 253, 0.15) 0%, rgba(0, 240, 255, 0.1) 100%)', border: '1px solid rgba(14, 116, 253, 0.2)' }}>
                <Shield style={{ width: '20px', height: '20px', color: '#00f0ff' }} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>DocuMind</h1>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingLeft: '8px', paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Local</span>
            </div>

            {/* Description Subtitle */}
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', margin: 0, lineHeight: '1.6', letterSpacing: '0.2px' }}>
              Upload PDF or DOCX files to run document structure chunk searches completely offline on your device machine layers.
            </p>

            {/* Drag & Drop Card */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                padding: '60px 40px',
                borderRadius: '16px',
                backgroundColor: '#0d1527',
                border: `2px dashed ${dragOver ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: dragOver ? 'rgba(14, 116, 253, 0.08)' : '#0d1527',
              }}
            >
              <Upload style={{ width: '40px', height: '40px', color: '#94a3b8', strokeWidth: 1.5 }} />
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', margin: 0, letterSpacing: '0.3px' }}>
                  {selectedFile ? selectedFile.name : 'Drag your file here or click to browse'}
                </p>
                <span style={{ fontSize: '12px', color: '#475569', margin: 0 }}>PDF or DOCX up to 25MB</span>
              </div>
              <input
                id="premium-upload-trigger"
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>

            {/* Action Processing Button */}
            <button
              onClick={() => {
                if (!selectedFile) {
                  document.getElementById('premium-upload-trigger')?.click();
                } else {
                  handleProcessDocument();
                }
              }}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: uploading ? '#64748b' : '#38bdf8',
                color: uploading ? '#a1a5a8' : '#030712',
                fontWeight: '700',
                fontSize: '14px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                opacity: uploading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!uploading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(56, 189, 248, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FileText style={{ width: '16px', height: '16px', strokeWidth: 2.5 }} />
              {uploading ? 'Processing...' : selectedFile ? 'Process Document' : 'Select File'}
            </button>

            {/* Close Button */}
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontWeight: '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.color = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#94a3b8';
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        {/* MESSAGES DISPLAY SCROLL STREAM */}
        <div style={{ flex: 1, padding: 'clamp(20px 16px, 5vw, 40px 12%)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          {activeSession.history.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(14, 116, 253, 0.1) 0%, rgba(0, 240, 255, 0.05) 100%)', border: '1px solid rgba(14, 116, 253, 0.2)', boxShadow: '0 0 20px rgba(0, 240, 255, 0.05)' }}>
                <Shield style={{ color: '#0e74fd', width: '28px', strokeWidth: 1.5 }} />
              </div>
              <div>
                <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', color: '#f8fafc', margin: '0 0 12px 0', letterSpacing: '-0.8px', background: 'linear-gradient(to right, #f8fafc, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome to DocuMind</h2>
                <p style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#94a3b8', margin: 0, lineHeight: '1.75', letterSpacing: '0.3px' }}>Upload documents into the active thread, then ask precise questions. Each session keeps its own isolated document vector store.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%', marginTop: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(14, 116, 253, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <p style={{ margin: 0, color: '#00f0ff', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Thread Isolation</p>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Each session stores its own documents separately.</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(14, 116, 253, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <p style={{ margin: 0, color: '#00f0ff', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Offline LLM</p>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>Gemma2 runs locally without API calls.</p>
                </div>
              </div>
            </div>
          ) : (
            activeSession.history.map((msg, index) => (
              <div key={index} style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: `fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both` }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.2em' }}>
                  {msg.role === 'user' ? 'You' : 'DocuMind'}
                </span>
                
                <div style={{
                  maxWidth: 'min(90%, 720px)',
                  padding: msg.role === 'user' ? '16px 22px' : '18px 22px',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                  background: msg.role === 'user'
                    ? 'rgba(14, 116, 253, 0.12)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(14, 116, 253, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: msg.role === 'user' ? 'blur(4px)' : 'blur(8px)',
                  color: '#f1f5f9',
                  boxShadow: msg.role === 'user'
                    ? '0 0 12px rgba(14, 116, 253, 0.1)'
                    : '0 0 16px rgba(0, 240, 255, 0.02)',
                }}>
                  <div style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: '1.75', letterSpacing: '0.15px', color: msg.role === 'user' ? '#e2e8f0' : '#cbd5e1' }}>
                    {msg.role === 'user' ? msg.text : formatMarkdownText(msg.text)}
                  </div>
                  
                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {msg.citations.map((cite, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '999px',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            background: 'rgba(0, 240, 255, 0.05)',
                            color: '#00f0ff',
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.05em',
                            boxShadow: '0 0 8px rgba(0, 240, 255, 0.1)',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {loadingAnswer && (
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'flex-start', animation: 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.2em' }}>DocuMind</span>
              <div style={{ maxWidth: 'min(90%, 720px)', padding: '18px 22px', borderRadius: '4px 20px 20px 20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'linear-gradient(to right, #0e74fd, #00f0ff)',
                          animation: `pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500', letterSpacing: '0.3px' }}>Analyzing vectors...</span>
                </div>
                <div style={{ marginTop: '12px', height: '3px', background: 'linear-gradient(to right, rgba(0, 240, 255, 0.2), rgba(14, 116, 253, 0.2), transparent)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: 'linear-gradient(to right, #0e74fd, #00f0ff)', animation: 'shimmer 1.5s infinite' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* PREMIUM FLOATING PROMPT BOARD INPUT */}
        <div style={{ padding: 'clamp(20px 16px, 3vw, 36px 12%)', background: 'linear-gradient(to top, rgba(5, 7, 15, 0.8), transparent)', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleChatSubmission} style={{ display: 'flex', position: 'relative', alignItems: 'stretch' }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask DocuMind about these documents..."
              disabled={loadingAnswer}
              style={{
                flex: 1,
                padding: 'clamp(14px 16px, 2vw, 18px 20px)',
                borderRadius: '16px',
                border: '1px solid rgba(14, 116, 253, 0.2)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f8fafc',
                fontSize: 'clamp(13px, 2vw, 15px)',
                outline: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 0 0 rgba(0, 240, 255, 0)',
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.15), inset 0 0 10px rgba(0, 240, 255, 0.05)';
                e.target.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                e.target.style.background = 'rgba(15, 23, 42, 0.8)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 0 0 0 rgba(0, 240, 255, 0)';
                e.target.style.borderColor = 'rgba(14, 116, 253, 0.2)';
                e.target.style.background = 'rgba(15, 23, 42, 0.6)';
              }}
            />
            <button
              type="submit"
              disabled={loadingAnswer || !question.trim()}
              style={{
                marginLeft: '12px',
                width: 'clamp(42px, 8vw, 52px)',
                height: 'clamp(42px, 8vw, 52px)',
                borderRadius: '14px',
                border: 'none',
                background: question.trim() && !loadingAnswer
                  ? 'linear-gradient(135deg, #0e74fd 0%, #00f0ff 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loadingAnswer ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: question.trim() && !loadingAnswer ? '0 0 16px rgba(0, 240, 255, 0.2)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!loadingAnswer && question.trim()) {
                  e.target.style.transform = 'scale(1.08)';
                  e.target.style.boxShadow = '0 0 24px rgba(0, 240, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.2)';
              }}
            >
              <Send
                style={{
                  width: 'clamp(16px, 4vw, 20px)',
                  height: 'clamp(16px, 4vw, 20px)',
                  color: loadingAnswer || !question.trim() ? '#64748b' : '#030712',
                  transition: 'all 0.3s ease',
                }}
              />
            </button>
          </form>
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        input::placeholder {
          color: rgba(148, 163, 184, 0.6);
          font-style: italic;
          letter-spacing: 0.2px;
        }

        input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 999px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, rgba(14, 116, 253, 0.3), rgba(0, 240, 255, 0.2));
          border-radius: 999px;
          transition: all 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, rgba(14, 116, 253, 0.5), rgba(0, 240, 255, 0.4));
        }

        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
}