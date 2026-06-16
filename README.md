# 🛡️ DocuMind Pro

DocuMind Pro is a high-performance, fully offline **Retrieval-Augmented Generation (RAG)** document intelligence platform. It is engineered to deliver enterprise-grade document analysis with absolute data privacy by operating entirely on your local machine layers.

---

## 🚀 Key Features

* **Complete Data Sovereignty:** Run complex AI workflows 100% locally. Your documents never touch external cloud endpoints or third-party APIs.
* **Parent-Child Retrieval Framework:** Advanced chunking strategy that splits text into fine-grained child vectors for high-precision semantic matching, but returns the broad, unfragmented parent context paragraphs to the LLM to eliminate cut-off sentences.
* **Multi-Tenant Thread Isolation:** Complete workspace sandboxing. Vector collections are strictly filtered by unique session IDs inside ChromaDB, ensuring documents uploaded in one chat room never bleed into another.
* **Premium UX:** A highly responsive glassmorphism workspace interface mimicking ChatGPT/Gemini, featuring dynamic thread title updates, interactive sidebar session tracking, and real-time citation badges.
* **Advanced Drag-and-Drop Sandbox:** A modern, visual upload zone supporting effortless file handling with the ability to view and prune files directly from the live session pool.

---

## 🛠️ Tech Stack & Architecture

### Frontend
* **Core Framework:** React.js (Vite)
* **Styling & UI:** Modern Custom Glassmorphic System & Tailwind tokens
* **Icons:** Lucide React
* **State Management:** Session-isolated LocalStorage synchronization

### Backend
* **API Engine:** FastAPI (Python)
* **Data Validation:** Pydantic v2
* **File Handling:** Python-Multipart

### AI & Vector Infrastructure
* **Pipeline Orchestration:** LangChain Core / LangChain Community
* **Local Inference Engine:** Ollama (`gemma2:2b`) at a deterministic `temperature: 0.0`
* **Embedding Model:** HuggingFace Transformers (`all-MiniLM-L6-v2`)
* **Vector Database:** ChromaDB (Persistent Disk Storage)

---

## 🔌 Backend API Specification

The FastAPI backend exposes standard REST endpoints for managing multi-tenant document lifecycles and pipeline inferences.

### 1. Upload and Index Document
* **Endpoint:** `POST /api/upload`
* **Content-Type:** `multipart/form-data`
* **Request Parameters:**
  * `file`: `UploadFile` (Binary stream of `.pdf` or `.docx`)
  * `session_id`: `string` (Unique workspace chat thread UUID)
* **Success Response (200 OK):**
```json
{
  "filename": "machine_learning_spec.pdf",
  "page_count": 14,
  "indexed_chunks": 42,
  "status": "Success"
}
