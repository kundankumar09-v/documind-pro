<div align="center">
  <img src="https://img.icons8.com/?size=512&id=vBw81wP69ZtX&format=png" alt="DocuMind Logo" width="100"/>
  <h1>🛡️ DocuMind Pro</h1>
  <p><strong>Offline & Secure Local Document Intelligence Engine</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama" />
    <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
  </p>
</div>

---

## 🌟 Overview

**DocuMind Pro** is an enterprise-grade **Retrieval-Augmented Generation (RAG)** platform designed for absolute data privacy. It runs entirely on your local machine—meaning your sensitive documents never touch the cloud. Chat with your PDFs and DOCX files securely, locally, and blazingly fast.

## ✨ Advanced Features

* 🔒 **100% Offline & Private:** Powered by local LLMs (Gemma2 via Ollama) and local embeddings (ChromaDB). No API keys, no internet required.
* ⚡ **Real-Time Streaming:** Enjoy token-by-token streaming responses with Server-Sent Events (SSE) for a fluid, ChatGPT-like experience.
* 🧠 **Conversation Memory:** Context-aware AI that remembers your last 6 messages, allowing for natural, conversational follow-up questions.
* 📝 **Instant Auto-Summarization:** The moment you upload a document, DocuMind extracts a preview and generates a concise summary banner so you know exactly what you're looking at.
* 🛡️ **Session Isolation (Multi-Tenancy):** Each chat session is an isolated sandbox. Documents uploaded in one thread will never contaminate the answers in another.
* 🎯 **Parent-Child Retrieval Strategy:** We chunk documents into small pieces for highly accurate semantic search, but return the larger "parent" context to the AI to prevent cut-off sentences.
* 🎨 **Corporate Glassmorphism UI:** A stunning, premium React frontend with dynamic animations, typing indicators, syntax-highlighted code blocks, and 1-click copy functionality.

---

## 🛠️ Architecture

### Frontend (React + Vite)
- **Design System:** Custom CSS variables, glassmorphism, Lucide icons.
- **Features:** Drag-and-drop zones, collapsible sidebars, dynamic session renaming, smart scrolling.
- **State:** LocalStorage synchronization across browser reloads.

### Backend (FastAPI + Python)
- **RAG Pipeline:** LangChain Core, LangChain Community, HuggingFace `all-MiniLM-L6-v2`.
- **LLM:** Ollama (`gemma2:2b` configured for zero hallucination).
- **Vector Store:** Persistent ChromaDB with parent-child UUID mapping.
- **Endpoints:** Asynchronous streaming `/api/chat/stream`, robust multipart uploads via `/api/upload`.

---

## 🚀 Getting Started

### Prerequisites
1. Ensure you have **Node.js** and **Python 3.10+** installed.
2. Install [Ollama](https://ollama.ai/) and pull the required model:
   ```bash
   ollama run gemma2:2b
   ```

### 1. Start the Backend
```bash
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
.\run_backend.ps1
```
*The FastAPI server will start on `http://127.0.0.1:8000`*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev -- --port 3000
```
*The Vite application will start on `http://localhost:3000`*

---

## 💡 Usage Guide

1. **Sign Up / Login:** (Mock auth for demonstration—any email + 6 char password works).
2. **Create a Session:** Press `Ctrl + K` or click "New Chat".
3. **Upload Documents:** Drag and drop a PDF or DOCX file into the chat.
4. **Chat & Analyze:** Watch the auto-summary appear, then ask specific questions about the document.

<div align="center">
  <p><i>Engineered for zero-compromise local AI document intelligence.</i></p>
</div>
